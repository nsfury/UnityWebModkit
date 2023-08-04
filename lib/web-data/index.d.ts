export type WebDataNode = {
    offset: number;
    size: number;
    name: string;
    data?: ArrayBuffer;
};
export declare class WebData {
    signature: string;
    headLen: number;
    nodes: WebDataNode[];
    unityVersion: string | undefined;
    constructor(buffer: ArrayBuffer, resolvableNodes?: [string, number?][]);
    getNode(name: string): WebDataNode | undefined;
    private resolveUnityVersion;
}
//# sourceMappingURL=index.d.ts.map