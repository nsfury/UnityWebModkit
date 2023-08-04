declare abstract class CustomError extends Error {
    readonly message: string;
    abstract readonly name: string;
    constructor(message: string);
    print(): string;
}
export declare class UnresolvedMetadataError extends CustomError {
    readonly name = "UnresolvedMetadataError";
}
export declare class MetadataParsingError extends CustomError {
    readonly name = "MetadataParsingError";
}
export declare class Il2CppContextCreationError extends CustomError {
    readonly name = "Il2CppContextCreationError";
}
export {};
//# sourceMappingURL=index.d.ts.map