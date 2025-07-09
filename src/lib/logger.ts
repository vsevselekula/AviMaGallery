type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Типы для данных логирования
type LogData =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | null
  | undefined
  | Error
  | unknown;

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: LogData;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isClient = typeof window !== 'undefined';

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: LogData,
    context?: string
  ): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // В production логируем только warn и error
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private logToConsole(entry: LogEntry) {
    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}${entry.context ? ` [${entry.context}]` : ''}:`;

    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.data || '');
        break;
      case 'info':
        console.info(prefix, entry.message, entry.data || '');
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.data || '');
        break;
      case 'error':
        console.error(prefix, entry.message, entry.data || '');
        break;
    }
  }

  private async logToExternal(entry: LogEntry) {
    // В будущем здесь можно добавить отправку в внешние системы мониторинга
    // например, Sentry, LogRocket, или собственный сервис
    if (!this.isDevelopment && entry.level === 'error') {
      // TODO: Отправка критических ошибок в систему мониторинга
    }
  }

  debug(message: string, data?: LogData, context?: string) {
    const entry = this.formatMessage('debug', message, data, context);
    if (this.shouldLog('debug')) {
      this.logToConsole(entry);
    }
  }

  info(message: string, data?: LogData, context?: string) {
    const entry = this.formatMessage('info', message, data, context);
    if (this.shouldLog('info')) {
      this.logToConsole(entry);
    }
  }

  warn(message: string, data?: LogData, context?: string) {
    const entry = this.formatMessage('warn', message, data, context);
    if (this.shouldLog('warn')) {
      this.logToConsole(entry);
      this.logToExternal(entry);
    }
  }

  error(message: string, error?: LogData, context?: string) {
    const entry = this.formatMessage('error', message, error, context);
    if (this.shouldLog('error')) {
      this.logToConsole(entry);
      this.logToExternal(entry);
    }
  }

  // Специальные методы для разных контекстов
  auth = {
    debug: (message: string, data?: LogData) =>
      this.debug(message, data, 'AUTH'),
    info: (message: string, data?: LogData) => this.info(message, data, 'AUTH'),
    warn: (message: string, data?: LogData) => this.warn(message, data, 'AUTH'),
    error: (message: string, error?: LogData) =>
      this.error(message, error, 'AUTH'),
  };

  api = {
    debug: (message: string, data?: LogData) =>
      this.debug(message, data, 'API'),
    info: (message: string, data?: LogData) => this.info(message, data, 'API'),
    warn: (message: string, data?: LogData) => this.warn(message, data, 'API'),
    error: (message: string, error?: LogData) =>
      this.error(message, error, 'API'),
  };

  db = {
    debug: (message: string, data?: LogData) => this.debug(message, data, 'DB'),
    info: (message: string, data?: LogData) => this.info(message, data, 'DB'),
    warn: (message: string, data?: LogData) => this.warn(message, data, 'DB'),
    error: (message: string, error?: LogData) =>
      this.error(message, error, 'DB'),
  };

  ui = {
    debug: (message: string, data?: LogData) => this.debug(message, data, 'UI'),
    info: (message: string, data?: LogData) => this.info(message, data, 'UI'),
    warn: (message: string, data?: LogData) => this.warn(message, data, 'UI'),
    error: (message: string, error?: LogData) =>
      this.error(message, error, 'UI'),
  };
}

// Экспортируем единственный экземпляр логгера
export const logger = new Logger();

// Для обратной совместимости экспортируем отдельные функции
export const { debug, info, warn, error } = logger;
