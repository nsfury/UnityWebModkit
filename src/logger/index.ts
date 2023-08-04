export enum LogLevel {
  NONE = 0x0,
  ERROR = 0x1,
  WARN = 0x2,
  INFO = 0x4,
  DEBUG = 0x8,
  MESSAGE = 0x10,
  ALL = 0x1f,
}

export class Logger {
  private name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public error(...args: any[]): void {
    this.log(LogLevel.ERROR, ...args);
  }

  public warn(...args: any[]): void {
    this.log(LogLevel.WARN, ...args);
  }

  public info(...args: any[]): void {
    this.log(LogLevel.INFO, ...args);
  }

  public debug(...args: any[]): void {
    this.log(LogLevel.DEBUG, ...args);
  }

  public message(...args: any[]): void {
    this.log(LogLevel.MESSAGE, ...args);
  }

  private log(level: LogLevel, ...args: any[]): void {
    if (this.shouldLog(level) && args.length > 0) {
      const logPrefix = `%c[${this.name}] %c[${LogLevel[level]}]%c`;
      let message = args.shift();
      if (typeof message !== "string") {
        args.push(message);
        message = "";
      } else {
        message = " " + message;
      }
      let logStyles = "color: #fff;";
      let messageStyles;

      switch (level) {
        case LogLevel.ERROR:
          messageStyles = "color: #FF6E74;";
          break;
        case LogLevel.WARN:
          messageStyles = "color: #FFB36A;";
          break;
        case LogLevel.INFO:
          messageStyles = "color: #35EA93;";
          break;
        case LogLevel.DEBUG:
          messageStyles = "color: #BE7CFF;";
          break;
        case LogLevel.MESSAGE:
          messageStyles = "color: #56C4FF;";
          break;
      }

      console.log(
        logPrefix + message,
        logStyles,
        messageStyles,
        "color: default;",
        ...args
      );
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (level === LogLevel.DEBUG)
      // @ts-ignore
      return DEVELOPMENT;
    return true;
  }
}
