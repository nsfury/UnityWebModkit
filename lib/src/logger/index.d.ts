export declare enum LogLevel {
    ERROR = 1,
    WARN = 2,
    INFO = 4,
    DEBUG = 8,
    MESSAGE = 16
}
export declare class Logger {
    private name;
    private logLevel;
    constructor(name: string, logLevel?: LogLevel);
    private log;
    private shouldLog;
    setLogLevel(logLevel: LogLevel): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
    debug(...args: any[]): void;
    message(...args: any[]): void;
}
//# sourceMappingURL=index.d.ts.map