export const SECTION_TYPE: 1;
export const SECTION_ELEMENT: 9;
export const SECTION_CODE: 10;
export const OP_CALL: 16;
export function VarUint32ToArray(x: any): number[];
export class WailVariable {
    _value: any;
    set value(arg: any);
    get value(): any;
    i32(): any;
    f32(): Uint8Array | WailF32;
    i64(): any;
    f64(): Uint8Array | WailF64;
    varUint32(): any;
}
export const BufferReader: {
    new (buffer: any): {
        inBuffer: Uint8Array | null;
        outBuffer: Uint8Array;
        inPos: number;
        _copyPos: number;
        outPos: number;
        _anchor: number | null;
        load(buffer: any): void;
        resize(): void;
        readUint8(): number;
        readUint32(): number;
        readVarUint32(): number;
        readUint64(): number;
        readUint128(): number;
        readBytes(length: any): Uint8Array;
        copyBuffer(buffer: any): void;
        commitBytes(): void;
        updateCopyPosition(): void;
        setAnchor(): void;
        readFromAnchor(): Uint8Array;
        writeAtAnchor(buffer: any): void;
        write(): Uint8Array;
    };
};
declare const WailParser_base: {
    new (buffer: any): {
        inBuffer: Uint8Array | null;
        outBuffer: Uint8Array;
        inPos: number;
        _copyPos: number;
        outPos: number;
        _anchor: number | null;
        load(buffer: any): void;
        resize(): void;
        readUint8(): number;
        readUint32(): number;
        readVarUint32(): number;
        readUint64(): number;
        readUint128(): number;
        readBytes(length: any): Uint8Array;
        copyBuffer(buffer: any): void;
        commitBytes(): void;
        updateCopyPosition(): void;
        setAnchor(): void;
        readFromAnchor(): Uint8Array;
        writeAtAnchor(buffer: any): void;
        write(): Uint8Array;
    };
};
export class WailParser extends WailParser_base {
    _finished: boolean;
    _newSections: any[];
    _removeSectionIds: any[];
    _resolvedTables: boolean;
    _importFuncCount: number;
    _importFuncNewCount: number;
    _importGlobalCount: number;
    _importGlobalNewCount: number;
    _globalImportCallback: any;
    _importCallbacks: any[];
    _globalExportCallback: any;
    _exportCallbacks: any[];
    _globalFunctionCallback: any;
    _functionCallbacks: any[];
    _globalInstructionCallback: any;
    _instructionCallbacks: {};
    _sectionOptions: {};
    _requiredSectionFlags: number;
    _optionalSectionFlags: number;
    _parsedSections: number;
    __variables: any[];
    parse(): void;
    removeSection(id: any): void;
    addTypeEntry(options: any): WailVariable;
    editTypeEntry(index: any, options: any): void;
    addImportEntry(options: any): WailVariable;
    editImportEntry(index: any, options: any): void;
    addImportElementParser(index: any, callback: any): void;
    addFunctionEntry(options: any): WailVariable;
    editFunctionEntry(index: any, options: any): void;
    getFunctionIndex(oldIndex: any): WailVariable;
    addGlobalEntry(options: any): WailVariable;
    editGlobalEntry(globalIndex: any, options: any): void;
    getGlobalIndex(oldIndex: any): any;
    addExportEntry(index: any, options: any): WailVariable;
    editExportEntry(index: any, options: any): void;
    addExportElementParser(index: any, callback: any): void;
    editStartEntry(newIndex: any): void;
    addElementEntry(options: any): WailVariable;
    editElementEntry(index: any, options: any): void;
    addCodeEntry(funcIndex: any, options: any): WailVariable;
    editCodeEntry(funcIndex: any, options: any): void;
    addDataEntry(options: any): WailVariable;
    editDataEntry(index: any, options: any): void;
    addCodeElementParser(index: any, callback: any): void;
    addInstructionParser(opcode: any, callback: any): void;
    addRawSection(id: any, sectionBytes: any): void;
    _createVariable(): WailVariable;
    _getVariable(id: any): any;
    _setVariable(id: any, value: any): void;
    _expandArrayVariables(array: any): any;
    _readSection(): void;
    _resolveTableIndices(): void;
    _addTypeSection(): void;
    _parseTypeSection(): void;
    _addImportSection(): void;
    _parseImportSection(): void;
    _addFunctionSection(): void;
    _parseFunctionSection(): void;
    _addGlobalSection(): void;
    _parseGlobalSection(): void;
    _addExportSection(): void;
    _parseExportSection(): void;
    _parseStartSection(): void;
    _addElementSection(): void;
    _parseElementSection(): void;
    _addCodeSection(): void;
    _parseCodeSection(): void;
    _addDataSection(): void;
    _parseDataSection(): void;
    _readFunction(reader: any, funcIndex: any): {
        locals: any[];
        instructions: any[];
    };
    _readInstruction(reader: any): any;
    _funcSectionIndexToFuncTableIndex(index: any): any;
    _getAdjustedFunctionIndex(index: any): any;
    _getAdjustedGlobalIndex(index: any): any;
}
declare class WailF32 extends TypedWailVariable {
    get value(): number[];
}
declare class WailF64 extends TypedWailVariable {
    get value(): number[];
}
declare class TypedWailVariable {
    constructor(parentVariable: any);
    _parent: any;
}
export {};
//# sourceMappingURL=index.d.ts.map