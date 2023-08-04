import { Logger } from "../logger";
export declare class Runtime {
    tableName: string | undefined;
    private logger;
    private plugins;
    private startedInitializing;
    private allReferencedAssemblies;
    private globalMetadata;
    private il2CppContext;
    private resolvedIl2CppFunctions;
    private instantiateStreaming;
    private internalMappings;
    private internalWasmTypes;
    private internalWasmCode;
    constructor();
    createPlugin(name: string, version?: string): ModkitPlugin;
    private initialize;
    private loadGlobalMetadata;
    private hookWasmInstantiate;
    private onWebAssemblyInstantiateStreaming;
    private handleBuffer;
    private searchWasmBinary;
    private resolveIl2CppFunctions;
    private exportIl2CppFunctions;
    resolveTableName(asm: any): string;
    createMstr(char: string): number;
    malloc(size: number): number;
    free(block: number | ValueWrapper): void;
    getTableIndex(targetClass: string, targetMethod: string): number;
    private getInternalIndex;
    private getHookByIndex;
    private getUnappliedHooks;
}
type Hook = {
    index?: number;
    tableIndex?: number;
    typeName: string;
    methodName: string;
    params: string[];
    returnType?: string;
    applied: boolean;
    kind: number;
    callback: PrefixCallback | PostfixCallback;
};
export type HookInfo = {
    typeName: string;
    methodName: string;
    params: string[];
    returnType?: string;
};
type PrefixCallback = ((...args: any) => boolean) | (() => void);
type PostfixCallback = (...args: any) => void;
declare class ModkitPlugin {
    readonly name: string;
    readonly version: string;
    readonly logger: Logger;
    private _referencedAssemblies;
    private _hooks;
    private _runtime;
    constructor(name: string, version: string, runtime: Runtime);
    get hooks(): Hook[];
    get referencedAssemblies(): string[];
    hookPrefix(target: HookInfo, callback: PrefixCallback): void;
    hookPostfix(target: HookInfo, callback: PostfixCallback): void;
    referenceAssemblies(assemblies: string[]): void;
    call(target: string, args: any[]): void;
    call(targetClass: string, targetMethod: string, args: any[]): void;
    createMstr(char: string): number;
    malloc(size: number): ValueWrapper;
    free(block: number | ValueWrapper): void;
}
export declare class ValueWrapper {
    private _result;
    constructor(result: number);
    set(value: number): void;
    val(): number;
    mstr(): string;
    getClassName(): string;
    readField(offset: number, type: string): ValueWrapper | undefined;
    writeField(offset: number, type: string, value: number): void;
    private static readUtf16Char;
}
export {};
//# sourceMappingURL=index.d.ts.map