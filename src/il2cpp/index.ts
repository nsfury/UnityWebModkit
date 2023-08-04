import { ok, err, Result } from "neverthrow";
import { BinaryReader, BinaryWriter } from "../utils/binary";
import { Il2CppContextCreationError, MetadataParsingError } from "../errors";
import { patternSearch } from "../utils";

export type Il2CppMetadata = {
  buffer: ArrayBuffer;
  header: Il2CppGlobalMetadataHeader;
  imageDefs: Il2CppImageDefinition[];
  typeDefs: Il2CppTypeDefinition[];
  methodDefs: Il2CppMethodDefinition[];
  originalImageDefCount: number;
  originalMethodDefCount: number;
  version: number;
};

type Il2CppGlobalMetadataHeader = {
  sanity: number;
  version: number;
  stringLiteralOffset: number;
  stringLiteralSize: number;
  stringLiteralDataOffset: number;
  stringLiteralDataSize: number;
  stringOffset: number;
  stringSize: number;
  eventsOffset: number;
  eventsSize: number;
  propertiesOffset: number;
  propertiesSize: number;
  methodsOffset: number;
  methodsSize: number;
  parameterDefaultValuesOffset: number;
  parameterDefaultValuesSize: number;
  fieldDefaultValuesOffset: number;
  fieldDefaultValuesSize: number;
  fieldAndParameterDefaultValueDataOffset: number;
  fieldAndParameterDefaultValueDataSize: number;
  fieldMarshaledSizesOffset: number;
  fieldMarshaledSizesSize: number;
  parametersOffset: number;
  parametersSize: number;
  fieldsOffset: number;
  fieldsSize: number;
  genericParametersOffset: number;
  genericParametersSize: number;
  genericParameterConstraintsOffset: number;
  genericParameterConstraintsSize: number;
  genericContainersOffset: number;
  genericContainersSize: number;
  nestedTypesOffset: number;
  nestedTypesSize: number;
  interfacesOffset: number;
  interfacesSize: number;
  vtableMethodsOffset: number;
  vtableMethodsSize: number;
  interfaceOffsetsOffset: number;
  interfaceOffsetsSize: number;
  typeDefinitionsOffset: number;
  typeDefinitionsSize: number;
  // rgctxEntriesOffset: number; // Max v24.1
  // rgctxEntriesCount: number; // Max v24.1
  imagesOffset: number;
  imagesSize: number;
  assembliesOffset: number;
  assembliesSize: number;
  // metadataUsageListsOffset: number; // Max v24.5
  // metadataUsageListsCount: number; // Max v24.5
  // metadataUsagePairsOffset: number; // Max v24.5
  // metadataUsagePairsCount: number; // Max v24.5
  fieldRefsOffset: number;
  fieldRefsSize: number;
  referencedAssembliesOffset: number;
  referencedAssembliesSize: number;
  // attributesInfoOffset: number; // Max v27.2
  // attributesInfoCount: number; // Max v27.2
  // attributeTypesOffset: number; // Max v27.2
  // attributeTypesCount: number; // Max v27.2
  attributeDataOffset: number;
  attributeDataSize: number;
  attributeDataRangeOffset: number;
  attributeDataRangeSize: number;
  unresolvedVirtualCallParameterTypesOffset: number;
  unresolvedVirtualCallParameterTypesSize: number;
  unresolvedVirtualCallParameterRangesOffset: number;
  unresolvedVirtualCallParameterRangesSize: number;
  windowsRuntimeTypeNamesOffset: number;
  windowsRuntimeTypeNamesSize: number;
  windowsRuntimeStringsOffset: number;
  windowsRuntimeStringsSize: number;
  exportedTypeDefinitionsOffset: number;
  exportedTypeDefinitionsSize: number;
};

type Il2CppImageDefinition = {
  nameIndex: number;
  assemblyIndex: number;
  typeStart: number;
  typeCount: number;
  exportedTypeStart: number;
  exportedTypeCount: number;
  entryPointIndex: number;
  token: number;
  customAttributeStart: number;
  customAttributeCount: number;
};

type Il2CppTypeDefinition = {
  typeIndex?: number;
  nameIndex: number;
  namespaceIndex: number;
  byvalTypeIndex: number;
  declaringTypeIndex: number;
  parentIndex: number;
  elementTypeIndex: number;
  genericContainerIndex: number;
  flags: number;
  fieldStart: number;
  methodStart: number;
  eventStart: number;
  propertyStart: number;
  nestedTypesStart: number;
  interfacesStart: number;
  vtableStart: number;
  interfaceOffsetsStart: number;
  method_count: number;
  property_count: number;
  field_count: number;
  event_count: number;
  nested_type_count: number;
  vtable_count: number;
  interfaces_count: number;
  interface_offsets_count: number;
  bitfield: number;
  token: number;
};

type Il2CppMethodDefinition = {
  methodIndex?: number;
  nameIndex: number;
  declaringType: number;
  returnType: number;
  parameterStart: number;
  genericContainerIndex: number;
  token: number;
  flags: number;
  iflags: number;
  slot: number;
  parameterCount: number;
};

export type Il2CppContext = {
  codeGenModules: Il2CppCodeGenModuleCollection;
  codeGenModuleMethodPointers: Il2CppCodeGenModuleMethodPointers;
  scriptData: Il2CppScriptData;
};

type Il2CppCodeGenModule = {
  moduleName: number;
  methodPointerCount: number;
  methodPointers: number;
  adjustorThunkCount: number;
  adjustorThunks: number;
  invokerIndices: number;
  reversePInvokeWrapperCount: number;
  reversePInvokeWrapperIndices: number;
  rgctxRangesCount: number;
  rgctxRanges: number;
  rgctxsCount: number;
  rgctxs: number;
  debuggerMetadata: number;
  moduleInitializer: number;
  staticConstructorTypeIndices: number;
  metadataRegistration: number;
  codeRegistration: number;
};

type Il2CppCodeGenModuleCollection = {
  [moduleName: string]: Il2CppCodeGenModule;
};

type Il2CppCodeGenModuleMethodPointers = {
  [moduleName: string]: number[];
};

type Il2CppScriptData = {
  [typeName: string]: {
    [methodName: string]: number;
  };
};

type WebAssemblyDataSection = {
  index: number;
  offset: number;
  data: Uint8Array;
};

export function createIl2CppContext(
  buffer: ArrayBuffer,
  metadata: Il2CppMetadata,
  referencedAssemblies?: string[]
): Result<Il2CppContext, Il2CppContextCreationError> {
  const dataSections: WebAssemblyDataSection[] = [];
  const reader = new BinaryReader(buffer);
  reader.seek(8);
  while (reader.offset < buffer.byteLength) {
    const id = reader.readULEB128();
    const len = reader.readULEB128();
    if (id !== 11) {
      // Skip until we reach data section
      reader.seek(reader.offset + len);
      continue;
    }
    const count = reader.readULEB128();
    for (let i = 0; i < count; i++) {
      const index = reader.readULEB128();
      reader.seek(reader.offset + 1);
      const offset = reader.readULEB128();
      reader.seek(reader.offset + 1);
      const data = reader.readUint8Array(reader.readULEB128());
      dataSections.push({
        index,
        offset,
        data,
      });
    }
    break;
  }
  const last = dataSections[dataSections.length - 1];
  const bssStart = last.offset + last.data.length;
  // Initialized memory buffer
  const memoryBuffer = new ArrayBuffer(buffer.byteLength);
  const memoryReader = new BinaryReader(memoryBuffer);
  const memoryWriter = new BinaryWriter(memoryBuffer);
  dataSections.forEach((dataSection) => {
    memoryWriter.seek(dataSection.offset);
    memoryWriter.writeBytes(dataSection.data);
  });
  // Plus search
  const sectionHelper = getSectionHelper(
    buffer.byteLength,
    memoryBuffer,
    bssStart,
    metadata.methodDefs.length,
    metadata.originalImageDefCount
  );
  const codeRegistration = sectionHelper.findCodeRegistration();
  const pCodeRegistration = readCodeRegistration(
    memoryReader,
    codeRegistration
  );
  const pCodeGenModules = readCodeGenModules(
    memoryReader,
    pCodeRegistration.codeGenModules,
    pCodeRegistration.codeGenModulesCount
  );
  const codeGenModules: Il2CppCodeGenModuleCollection = {};
  const codeGenModuleMethodPointers: Il2CppCodeGenModuleMethodPointers = {};
  for (let i = 0; i < pCodeGenModules.length; i++) {
    const pCodeGenModule = readCodeGenModule(memoryReader, pCodeGenModules[i]);
    memoryReader.seek(pCodeGenModule.moduleName);
    const moduleName = memoryReader.readNullTerminatedUTF8String();
    if (!referencedAssemblies?.includes(moduleName)) continue;
    codeGenModules[moduleName] = pCodeGenModule;
    const methodPointers = readCodeGenModuleMethodPointers(
      memoryReader,
      pCodeGenModule.methodPointers,
      pCodeGenModule.methodPointerCount
    );
    codeGenModuleMethodPointers[moduleName] = methodPointers;
  }
  const scriptData: Il2CppScriptData = {};
  const metadataReader = new BinaryReader(metadata.buffer);
  for (let j = 0; j < metadata.imageDefs.length; j++) {
    let imageDef = metadata.imageDefs[j];
    let imageName = getStringFromIndex(
      metadataReader,
      metadata.header.stringOffset,
      imageDef.nameIndex
    );
    let typeEnd = imageDef.typeStart + imageDef.typeCount;
    for (let k = imageDef.typeStart; k < typeEnd; k++) {
      let typeDef = metadata.typeDefs.find((def) => def.typeIndex === k);
      if (!typeDef) continue;
      let typeName = getStringFromIndex(
        metadataReader,
        metadata.header.stringOffset,
        typeDef.nameIndex
      );
      let methodEnd = typeDef.methodStart + typeDef.method_count;
      for (let l = typeDef.methodStart; l < methodEnd; l++) {
        let methodDef = metadata.methodDefs.find(
          (def) => def.methodIndex === l
        );
        if (!methodDef) continue;
        let methodName = getStringFromIndex(
          metadataReader,
          metadata.header.stringOffset,
          methodDef.nameIndex
        );
        let methodToken = methodDef.token;
        let ptrs = codeGenModuleMethodPointers[imageName];
        let methodPointerIndex = methodToken & 0x00ffffff;
        const ptr = ptrs[methodPointerIndex - 1];
        const namespaceName = getStringFromIndex(
          metadataReader,
          metadata.header.stringOffset,
          typeDef.namespaceIndex
        );
        const fullTypeName =
          namespaceName === "" ? typeName : namespaceName + "." + typeName;
        if (!scriptData[fullTypeName]) {
          scriptData[fullTypeName] = {}; // Create an empty object if it doesn't exist
        }
        if (scriptData[fullTypeName][methodName] !== undefined) {
          const ptrRef = scriptData[fullTypeName][methodName];
          delete scriptData[fullTypeName][methodName];
          scriptData[fullTypeName][methodName + "_" + ptrRef] = ptrRef;
          methodName = `${methodName}_${ptr}`;
        }
        scriptData[fullTypeName][methodName] = ptr;
      }
    }
  }
  metadata.typeDefs.forEach((def) => delete def.typeIndex);
  metadata.methodDefs.forEach((def) => delete def.methodIndex);
  return ok({
    codeGenModules,
    codeGenModuleMethodPointers,
    scriptData,
  });
}

export function createMetadata(
  buffer: ArrayBuffer,
  referencedAssemblies?: string[]
): Result<Il2CppMetadata, MetadataParsingError> {
  const reader = new BinaryReader(buffer);
  const sanity = reader.readUint32();
  if (sanity !== 0xfab11baf)
    return err(
      new MetadataParsingError(
        "Metadata file supplied is not a valid metadata file."
      )
    );
  const version = reader.readUint32();
  if (version < 0 || version > 1000)
    return err(
      new MetadataParsingError(
        "Metadata file supplied is not a valid metadata file."
      )
    );
  // TODO: Support more metadata versions
  if (version !== 29)
    return err(
      new MetadataParsingError(
        `Metadata file supplied is not a supported version [${version}].`
      )
    );
  reader.seek(0);
  const header = readHeader(reader);
  const imageDefs = readImageDefinitions(
    reader,
    header.imagesOffset,
    header.imagesSize
  );
  const referencedImageDefs = [];
  var i = 0,
    len = imageDefs.length;
  while (i < len) {
    const imageDef = imageDefs[i];
    const imageName = getStringFromIndex(
      reader,
      header.stringOffset,
      imageDef.nameIndex
    );
    if (referencedAssemblies?.includes(imageName))
      referencedImageDefs.push(imageDef);
    i++;
  }
  let typeDefs = readTypeDefinitions(
    reader,
    header.typeDefinitionsOffset,
    header.typeDefinitionsSize,
    referencedImageDefs
  );
  const methodDefs = readMethodDefinitions(
    reader,
    header.methodsOffset,
    header.methodsSize
  );
  const referencedMethodDefs = [];
  (i = 0), (len = methodDefs.length);
  while (i < len) {
    const methodDef = methodDefs[i];
    if (
      typeDefs.findIndex((t) => t.typeIndex === methodDef.declaringType) !== -1
    )
      referencedMethodDefs.push(methodDef);
    i++;
  }
  return ok({
    buffer,
    header,
    imageDefs: referencedImageDefs,
    typeDefs,
    methodDefs,
    originalImageDefCount: imageDefs.length,
    originalMethodDefCount: methodDefs.length,
    version,
  });
}

function getStringFromIndex(
  reader: BinaryReader,
  base: number,
  offset: number
) {
  reader.seek(base + offset);
  return reader.readNullTerminatedUTF8String();
}

function isReferencedType(
  imageDefinitions: Il2CppImageDefinition[],
  typeDefinitionsOffset: number,
  readerOffset: number
) {
  const typeDefStructSize = 88; // TODO: define this somewhere else

  for (const imageDef of imageDefinitions) {
    let typeStart =
      imageDef.typeStart * typeDefStructSize + typeDefinitionsOffset;
    let typeCount = imageDef.typeCount * typeDefStructSize;
    let typeEnd = typeStart + typeCount;
    if (readerOffset >= typeStart && readerOffset < typeEnd) {
      return true;
    }
  }

  return false;
}

function readHeader(reader: BinaryReader): Il2CppGlobalMetadataHeader {
  return {
    sanity: reader.readUint32(),
    version: reader.readInt32(),
    stringLiteralOffset: reader.readUint32(),
    stringLiteralSize: reader.readInt32(),
    stringLiteralDataOffset: reader.readUint32(),
    stringLiteralDataSize: reader.readInt32(),
    stringOffset: reader.readUint32(),
    stringSize: reader.readInt32(),
    eventsOffset: reader.readUint32(),
    eventsSize: reader.readInt32(),
    propertiesOffset: reader.readUint32(),
    propertiesSize: reader.readInt32(),
    methodsOffset: reader.readUint32(),
    methodsSize: reader.readInt32(),
    parameterDefaultValuesOffset: reader.readUint32(),
    parameterDefaultValuesSize: reader.readInt32(),
    fieldDefaultValuesOffset: reader.readUint32(),
    fieldDefaultValuesSize: reader.readInt32(),
    fieldAndParameterDefaultValueDataOffset: reader.readUint32(),
    fieldAndParameterDefaultValueDataSize: reader.readInt32(),
    fieldMarshaledSizesOffset: reader.readInt32(),
    fieldMarshaledSizesSize: reader.readInt32(),
    parametersOffset: reader.readUint32(),
    parametersSize: reader.readInt32(),
    fieldsOffset: reader.readUint32(),
    fieldsSize: reader.readInt32(),
    genericParametersOffset: reader.readUint32(),
    genericParametersSize: reader.readInt32(),
    genericParameterConstraintsOffset: reader.readUint32(),
    genericParameterConstraintsSize: reader.readInt32(),
    genericContainersOffset: reader.readUint32(),
    genericContainersSize: reader.readInt32(),
    nestedTypesOffset: reader.readUint32(),
    nestedTypesSize: reader.readInt32(),
    interfacesOffset: reader.readUint32(),
    interfacesSize: reader.readInt32(),
    vtableMethodsOffset: reader.readUint32(),
    vtableMethodsSize: reader.readInt32(),
    interfaceOffsetsOffset: reader.readInt32(),
    interfaceOffsetsSize: reader.readInt32(),
    typeDefinitionsOffset: reader.readUint32(),
    typeDefinitionsSize: reader.readInt32(),
    /*rgctxEntriesOffset: reader.readUint32(), Max v24.1
        //rgctxEntriesCount: reader.readInt32(),*/
    imagesOffset: reader.readUint32(),
    imagesSize: reader.readInt32(),
    assembliesOffset: reader.readUint32(),
    assembliesSize: reader.readInt32(),
    /*metadataUsageListsOffset: reader.readUint32(), Max v24.5
        metadataUsageListsCount: reader.readInt32(),
        metadataUsagePairsOffset: reader.readUint32(),
        metadataUsagePairsCount: reader.readInt32(),*/
    fieldRefsOffset: reader.readUint32(),
    fieldRefsSize: reader.readInt32(),
    referencedAssembliesOffset: reader.readInt32(),
    referencedAssembliesSize: reader.readInt32(),
    /*attributesInfoOffset: reader.readUint32(), Max v27.2
        attributesInfoCount: reader.readInt32(),
        attributeTypesOffset: reader.readUint32(),
        attributeTypesCount: reader.readInt32(),*/
    attributeDataOffset: reader.readUint32(),
    attributeDataSize: reader.readInt32(),
    attributeDataRangeOffset: reader.readUint32(),
    attributeDataRangeSize: reader.readInt32(),
    unresolvedVirtualCallParameterTypesOffset: reader.readInt32(),
    unresolvedVirtualCallParameterTypesSize: reader.readInt32(),
    unresolvedVirtualCallParameterRangesOffset: reader.readInt32(),
    unresolvedVirtualCallParameterRangesSize: reader.readInt32(),
    windowsRuntimeTypeNamesOffset: reader.readInt32(),
    windowsRuntimeTypeNamesSize: reader.readInt32(),
    windowsRuntimeStringsOffset: reader.readInt32(),
    windowsRuntimeStringsSize: reader.readInt32(),
    exportedTypeDefinitionsOffset: reader.readInt32(),
    exportedTypeDefinitionsSize: reader.readInt32(),
  };
}

function readImageDefinitions(
  reader: BinaryReader,
  offset: number,
  size: number
): Il2CppImageDefinition[] {
  reader.seek(offset);
  const imageDefinitions = [];
  const imagesEnd = offset + size;
  while (reader.offset < imagesEnd) {
    imageDefinitions.push({
      nameIndex: reader.readUint32(),
      assemblyIndex: reader.readInt32(),
      typeStart: reader.readInt32(),
      typeCount: reader.readUint32(),
      exportedTypeStart: reader.readInt32(),
      exportedTypeCount: reader.readUint32(),
      entryPointIndex: reader.readInt32(),
      token: reader.readUint32(),
      customAttributeStart: reader.readInt32(),
      customAttributeCount: reader.readUint32(),
    });
  }
  return imageDefinitions;
}

function readTypeDefinitions(
  reader: BinaryReader,
  offset: number,
  size: number,
  imageDefinitions: Il2CppImageDefinition[]
): Il2CppTypeDefinition[] {
  reader.seek(offset);
  const typeDefinitions = [];
  const typesEnd = offset + size;
  let i = 0;
  while (reader.offset < typesEnd) {
    const typeDef = {
      typeIndex: i,
      nameIndex: reader.readUint32(),
      namespaceIndex: reader.readUint32(),
      byvalTypeIndex: reader.readInt32(),
      declaringTypeIndex: reader.readInt32(),
      parentIndex: reader.readInt32(),
      elementTypeIndex: reader.readInt32(),
      genericContainerIndex: reader.readInt32(),
      flags: reader.readUint32(),
      fieldStart: reader.readInt32(),
      methodStart: reader.readInt32(),
      eventStart: reader.readInt32(),
      propertyStart: reader.readInt32(),
      nestedTypesStart: reader.readInt32(),
      interfacesStart: reader.readInt32(),
      vtableStart: reader.readInt32(),
      interfaceOffsetsStart: reader.readInt32(),
      method_count: reader.readUint16(),
      property_count: reader.readUint16(),
      field_count: reader.readUint16(),
      event_count: reader.readUint16(),
      nested_type_count: reader.readUint16(),
      vtable_count: reader.readUint16(),
      interfaces_count: reader.readUint16(),
      interface_offsets_count: reader.readUint16(),
      bitfield: reader.readUint32(),
      token: reader.readUint32(),
    };
    i++;
    if (!isReferencedType(imageDefinitions, offset, reader.offset - 1))
      continue;
    typeDefinitions.push(typeDef);
  }
  return typeDefinitions;
}

function readMethodDefinitions(
  reader: BinaryReader,
  offset: number,
  size: number
): Il2CppMethodDefinition[] {
  reader.seek(offset);
  const methodDefinitions = [];
  const methodsEnd = offset + size;
  let i = 0;
  while (reader.offset < methodsEnd) {
    methodDefinitions.push({
      methodIndex: i,
      nameIndex: reader.readUint32(),
      declaringType: reader.readInt32(),
      returnType: reader.readInt32(),
      parameterStart: reader.readInt32(),
      genericContainerIndex: reader.readInt32(),
      token: reader.readUint32(),
      flags: reader.readUint16(),
      iflags: reader.readUint16(),
      slot: reader.readUint16(),
      parameterCount: reader.readUint16(),
    });
    i++;
  }
  return methodDefinitions;
}

function readCodeRegistration(reader: BinaryReader, offset: number) {
  reader.seek(offset);
  return {
    reversePInvokeWrapperCount: reader.readUint32(),
    reversePInvokeWrappers: reader.readUint32(),
    genericMethodPointersCount: reader.readUint32(),
    genericMethodPointers: reader.readUint32(),
    genericAdjustorThunks: reader.readUint32(),
    invokerPointersCount: reader.readUint32(),
    invokerPointers: reader.readUint32(),
    unresolvedVirtualCallCount: reader.readUint32(),
    unresolvedVirtualCallPointers: reader.readUint32(),
    interopDataCount: reader.readUint32(),
    interopData: reader.readUint32(),
    windowsRuntimeFactoryCount: reader.readUint32(),
    windowsRuntimeFactoryTable: reader.readUint32(),
    codeGenModulesCount: reader.readUint32(),
    codeGenModules: reader.readUint32(),
  };
}

function readCodeGenModules(
  reader: BinaryReader,
  offset: number,
  size: number
) {
  reader.seek(offset);
  const modules = [];
  for (let i = 0; i < size; i++) {
    modules.push(reader.readUint32());
  }
  return modules;
}

function readCodeGenModule(
  reader: BinaryReader,
  offset: number
): Il2CppCodeGenModule {
  reader.seek(offset);
  return {
    moduleName: reader.readUint32(),
    methodPointerCount: reader.readInt32(),
    methodPointers: reader.readUint32(),
    adjustorThunkCount: reader.readInt32(),
    adjustorThunks: reader.readUint32(),
    invokerIndices: reader.readUint32(),
    reversePInvokeWrapperCount: reader.readUint32(),
    reversePInvokeWrapperIndices: reader.readUint32(),
    rgctxRangesCount: reader.readInt32(),
    rgctxRanges: reader.readUint32(),
    rgctxsCount: reader.readInt32(),
    rgctxs: reader.readUint32(),
    debuggerMetadata: reader.readUint32(),
    moduleInitializer: reader.readUint32(),
    staticConstructorTypeIndices: reader.readUint32(),
    metadataRegistration: reader.readUint32(),
    codeRegistration: reader.readUint32(),
  };
}

function readCodeGenModuleMethodPointers(
  reader: BinaryReader,
  offset: number,
  size: number
) {
  reader.seek(offset);
  const methodPointers = [];
  for (let i = 0; i < size; i++) {
    methodPointers.push(reader.readUint32());
  }
  return methodPointers;
}

function getSectionHelper(
  length: number,
  memoryBuffer: ArrayBuffer,
  bssStart: number,
  methodCount: number,
  imageCount: number
) {
  const exec = {
    offset: 0,
    offsetEnd: methodCount,
    address: 0,
    addressEnd: methodCount,
  };
  const data = {
    offset: 1024,
    offsetEnd: length,
    address: 1024,
    addressEnd: length,
  };
  const bss = {
    offset: bssStart,
    offsetEnd: BigInt(9223372036854775807),
    address: bssStart,
    addressEnd: BigInt(9223372036854775807),
  };
  const sectionHelper = new SectionHelper(memoryBuffer, imageCount);
  sectionHelper.setExecSection(exec);
  sectionHelper.setDataSection(data);
  sectionHelper.setBssSection(bss);
  return sectionHelper;
}

class SectionHelper {
  private exec: any[] = [];
  private data: any[] = [];
  private bss: any[] = [];
  private memoryReader: BinaryReader;
  private imageCount: number;

  private static featureBytes = new Uint8Array([
    0x6d, 0x73, 0x63, 0x6f, 0x72, 0x6c, 0x69, 0x62, 0x2e, 0x64, 0x6c, 0x6c,
    0x00,
  ]);

  constructor(memoryBuffer: any, imageCount: number) {
    this.memoryReader = new BinaryReader(memoryBuffer);
    this.imageCount = imageCount;
  }

  public setExecSection(exec: any) {
    this.exec.push(exec);
  }

  public setDataSection(data: any) {
    this.data.push(data);
  }

  public setBssSection(bss: any) {
    this.bss.push(bss);
  }

  public findCodeRegistration(): number {
    let codeRegistration = this.findCodeRegistrationData();
    return codeRegistration;
  }

  private findCodeRegistrationData(): number {
    return this.findCodeRegistration2019(this.data);
  }

  private findCodeRegistration2019(secs: any[]): number {
    for (let i = 0; i < secs.length; i++) {
      const sec = secs[i];
      this.memoryReader.seek(sec.offset);
      const buff = this.memoryReader.readUint8Array(sec.offsetEnd - sec.offset);
      const matches = patternSearch(buff, SectionHelper.featureBytes);
      for (let j = 0; j < matches.length; j++) {
        const dllva = matches[j] + sec.address;
        const refvas = this.findReference(dllva);
        for (let k = 0; k < refvas.length; k++) {
          const refva = refvas[k];
          const refva2s = this.findReference(refva);
          for (let l = 0; l < refva2s.length; l++) {
            const refva2 = refva2s[l];
            for (let m = this.imageCount - 1; m >= 0; m--) {
              const refva3s = this.findReference(refva2 - m * 4);
              for (let n = 0; n < refva3s.length; n++) {
                const refva3 = refva3s[n];
                this.memoryReader.seek(refva3 - 4);
                if (this.memoryReader.readInt32() === this.imageCount) {
                  return refva3 - 4 * 14;
                }
              }
            }
          }
        }
      }
    }
    return 0;
  }

  private findReference(addr: number): number[] {
    const references: number[] = [];
    for (let i = 0; i < this.data.length; i++) {
      const dataSec = this.data[i];
      var position = dataSec.offset;
      const end =
        Math.min(dataSec.offsetEnd, this.memoryReader.buffer.byteLength) - 4;
      while (position < end) {
        this.memoryReader.seek(position);
        if (this.memoryReader.readUint32() === addr) {
          references.push(position - dataSec.offset + dataSec.address);
        }
        position += 4;
      }
    }
    return references;
  }
}
