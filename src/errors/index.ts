abstract class CustomError extends Error {
  abstract readonly name: string;

  constructor(readonly message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public print(): string {
    return this.name + ": " + this.message;
  }
}

export class UnresolvedMetadataError extends CustomError {
  readonly name = "UnresolvedMetadataError";
}

export class MetadataParsingError extends CustomError {
  readonly name = "MetadataParsingError";
}

export class Il2CppContextCreationError extends CustomError {
  readonly name = "Il2CppContextCreationError";
}
