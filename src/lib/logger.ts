export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: LogContext;
  error?: Error;
}

export interface LogTransport {
  log(entry: LogEntry): void | Promise<void>;
}

export interface LogFormatter {
  format(entry: LogEntry): string;
}

export class ConsoleTransport implements LogTransport {
  private formatter: LogFormatter;

  constructor(formatter?: LogFormatter) {
    this.formatter = formatter || new DefaultFormatter();
  }

  log(entry: LogEntry): void {
    const formatted = this.formatter.format(entry);
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.log(formatted);
        break;
    }
  }
}

export class DefaultFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    let message = `[${timestamp}] [${level}] ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      message += ` ${JSON.stringify(entry.context)}`;
    }
    
    if (entry.error) {
      message += `\n${entry.error.stack || entry.error.message}`;
    }
    
    return message;
  }
}

export class JSONFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      level: LogLevel[entry.level],
      message: entry.message,
      context: entry.context,
      error: entry.error ? {
        message: entry.error.message,
        stack: entry.error.stack,
        name: entry.error.name,
      } : undefined,
    });
  }
}

export class Logger {
  private level: LogLevel;
  private transports: LogTransport[];
  private context: LogContext;

  constructor(options?: {
    level?: LogLevel;
    transports?: LogTransport[];
    context?: LogContext;
  }) {
    this.level = options?.level ?? LogLevel.INFO;
    this.transports = options?.transports ?? [new ConsoleTransport()];
    this.context = options?.context ?? {};
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private async logEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: { ...this.context, ...context },
      error,
    };

    const promises = this.transports.map(transport => {
      const result = transport.log(entry);
      return result instanceof Promise ? result : Promise.resolve();
    });

    await Promise.all(promises);
  }

  error(message: string, error?: Error, context?: LogContext): Promise<void> {
    return this.logEntry(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext): Promise<void> {
    return this.logEntry(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): Promise<void> {
    return this.logEntry(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): Promise<void> {
    return this.logEntry(LogLevel.DEBUG, message, context);
  }

  trace(message: string, context?: LogContext): Promise<void> {
    return this.logEntry(LogLevel.TRACE, message, context);
  }

  child(context: LogContext): Logger {
    return new Logger({
      level: this.level,
      transports: this.transports,
      context: { ...this.context, ...context },
    });
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  removeTransport(transport: LogTransport): void {
    const index = this.transports.indexOf(transport);
    if (index !== -1) {
      this.transports.splice(index, 1);
    }
  }
}

let globalLogger: Logger | null = null;

export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger();
  }
  return globalLogger;
}

export function setGlobalLogger(logger: Logger): void {
  globalLogger = logger;
}