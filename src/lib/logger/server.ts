import { Logger, LogLevel, ConsoleTransport, LogTransport, LogEntry, JSONFormatter } from '../logger';
import fs from 'fs/promises';
import path from 'path';

export class FileTransport implements LogTransport {
  private filePath: string;
  private maxFileSize: number;
  private maxFiles: number;
  private formatter: JSONFormatter;

  constructor(options: {
    filePath: string;
    maxFileSize?: number;
    maxFiles?: number;
  }) {
    this.filePath = options.filePath;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    this.formatter = new JSONFormatter();
  }

  async log(entry: LogEntry): Promise<void> {
    try {
      const logLine = this.formatter.format(entry) + '\n';
      
      await this.ensureDirectory();
      await this.rotateIfNeeded();
      
      await fs.appendFile(this.filePath, logLine, 'utf-8');
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  private async ensureDirectory(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async rotateIfNeeded(): Promise<void> {
    try {
      const stats = await fs.stat(this.filePath);
      
      if (stats.size >= this.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = path.extname(this.filePath);
        const basename = path.basename(this.filePath, ext);
        const dir = path.dirname(this.filePath);
        const rotatedPath = path.join(dir, `${basename}-${timestamp}${ext}`);
        
        await fs.rename(this.filePath, rotatedPath);
        
        await this.cleanOldFiles();
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to rotate log file:', error);
      }
    }
  }

  private async cleanOldFiles(): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      const basename = path.basename(this.filePath, path.extname(this.filePath));
      const files = await fs.readdir(dir);
      
      const logFiles = files
        .filter(file => file.startsWith(basename) && file !== path.basename(this.filePath))
        .map(file => path.join(dir, file));
      
      if (logFiles.length > this.maxFiles) {
        const filesToDelete = logFiles
          .sort()
          .slice(0, logFiles.length - this.maxFiles);
        
        await Promise.all(filesToDelete.map(file => fs.unlink(file)));
      }
    } catch (error) {
      console.error('Failed to clean old log files:', error);
    }
  }
}

export class StreamTransport implements LogTransport {
  private stream: NodeJS.WritableStream;
  private formatter: JSONFormatter;

  constructor(stream: NodeJS.WritableStream) {
    this.stream = stream;
    this.formatter = new JSONFormatter();
  }

  log(entry: LogEntry): void {
    const formatted = this.formatter.format(entry) + '\n';
    this.stream.write(formatted);
  }
}

export function createServerLogger(options?: {
  level?: LogLevel;
  enableConsole?: boolean;
  enableFile?: boolean;
  filePath?: string;
  stream?: NodeJS.WritableStream;
}): Logger {
  const transports: LogTransport[] = [];

  if (options?.enableConsole !== false) {
    transports.push(new ConsoleTransport());
  }

  if (options?.enableFile && options?.filePath) {
    transports.push(new FileTransport({
      filePath: options.filePath,
    }));
  }

  if (options?.stream) {
    transports.push(new StreamTransport(options.stream));
  }

  return new Logger({
    level: options?.level ?? (process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG),
    transports,
    context: {
      pid: process.pid,
      hostname: process.env.HOSTNAME || 'unknown',
    },
  });
}

export function createAPILogger(serviceName: string): Logger {
  const logger = createServerLogger({
    enableFile: process.env.NODE_ENV === 'production',
    filePath: process.env.LOG_FILE_PATH || `./logs/${serviceName}.log`,
  });

  return logger.child({ service: serviceName });
}