import { Logger, LogLevel, ConsoleTransport, LogTransport, LogEntry, LogContext } from '../logger';

export class BrowserStorageTransport implements LogTransport {
  private maxLogs: number;
  private storageKey: string;

  constructor(storageKey = 'app_logs', maxLogs = 1000) {
    this.storageKey = storageKey;
    this.maxLogs = maxLogs;
  }

  log(entry: LogEntry): void {
    if (typeof window === 'undefined') return;

    try {
      const logs = this.getLogs();
      logs.push({
        ...entry,
        level: LogLevel[entry.level],
        timestamp: entry.timestamp.toISOString(),
      });

      if (logs.length > this.maxLogs) {
        logs.splice(0, logs.length - this.maxLogs);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log:', error);
    }
  }

  getLogs(): Array<{ timestamp: string; level: string; message: string; context?: LogContext; error?: Error }> {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  clearLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}

export class RemoteTransport implements LogTransport {
  private endpoint: string;
  private headers: Record<string, string>;
  private batchSize: number;
  private batchInterval: number;
  private queue: LogEntry[] = [];
  private timer: number | null = null;

  constructor(options: {
    endpoint: string;
    headers?: Record<string, string>;
    batchSize?: number;
    batchInterval?: number;
  }) {
    this.endpoint = options.endpoint;
    this.headers = options.headers || {};
    this.batchSize = options.batchSize || 10;
    this.batchInterval = options.batchInterval || 5000;
  }

  async log(entry: LogEntry): Promise<void> {
    this.queue.push(entry);

    if (this.queue.length >= this.batchSize) {
      await this.flush();
    } else if (!this.timer) {
      this.timer = window.setTimeout(() => this.flush(), this.batchInterval);
    }
  }

  private async flush(): Promise<void> {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify({
          logs: batch.map(entry => ({
            ...entry,
            timestamp: entry.timestamp.toISOString(),
            error: entry.error ? {
              message: entry.error.message,
              stack: entry.error.stack,
              name: entry.error.name,
            } : undefined,
          })),
        }),
      });
    } catch (error) {
      console.error('Failed to send logs to remote server:', error);
      this.queue.unshift(...batch);
    }
  }

  async destroy(): Promise<void> {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
    await this.flush();
  }
}

export function createClientLogger(options?: {
  level?: LogLevel;
  enableConsole?: boolean;
  enableStorage?: boolean;
  enableRemote?: boolean;
  remoteEndpoint?: string;
  remoteHeaders?: Record<string, string>;
}): Logger {
  const transports: LogTransport[] = [];

  if (options?.enableConsole !== false) {
    transports.push(new ConsoleTransport());
  }

  if (options?.enableStorage) {
    transports.push(new BrowserStorageTransport());
  }

  if (options?.enableRemote && options?.remoteEndpoint) {
    transports.push(new RemoteTransport({
      endpoint: options.remoteEndpoint,
      headers: options.remoteHeaders,
    }));
  }

  return new Logger({
    level: options?.level ?? (process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG),
    transports,
  });
}