import { BinaryReader } from "../utils/binary";

export type WebDataNode = {
  offset: number;
  size: number;
  name: string;
  data?: ArrayBuffer;
};

export class WebData {
  public signature: string;
  public headLen: number;
  public nodes: WebDataNode[] = [];
  public unityVersion: string | undefined;

  public constructor(
    buffer: ArrayBuffer,
    resolvableNodes?: [string, number?][],
  ) {
    const reader = new BinaryReader(buffer);
    this.signature = reader.readNullTerminatedUTF8String();
    this.headLen = reader.readUint32();
    while (reader.offset < this.headLen) {
      const node = {
        offset: reader.readUint32(),
        size: reader.readUint32(),
        name: reader.readUTF8StringWithLength(),
      };
      const resolvableNode = resolvableNodes?.find(
        (item) => item[0] === node.name,
      );
      if (!resolvableNode) continue;
      node.size = resolvableNode[1] ?? node.size;
      this.nodes.push(node);
    }
    for (const node of this.nodes) {
      node.data = reader.readSlice(node.offset, node.size);
    }
    this.resolveUnityVersion(reader);
  }

  public getNode(name: string) {
    return this.nodes.find((n) => n.name === name);
  }

  private resolveUnityVersion(reader: BinaryReader): void {
    const dataUnity3dNode = this.getNode("data.unity3d");
    if (!dataUnity3dNode || !dataUnity3dNode.data) return;
    const dataUnity3dReader = new BinaryReader(dataUnity3dNode.data);
    dataUnity3dReader.seek(18);
    this.unityVersion = dataUnity3dReader.readNullTerminatedUTF8String();
  }
}
