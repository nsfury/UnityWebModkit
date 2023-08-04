export declare enum LogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 4,
    DEBUG = 8,
    MESSAGE = 16,
    ALL = 31
}
export declare class Logger {
    private name;
    constructor(name: string);
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
    debug(...args: any[]): void;
    message(...args: any[]): void;
    private log;
    private shouldLog;
}
//# sourceMappingURL=index.d.ts.map