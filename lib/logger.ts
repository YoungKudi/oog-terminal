type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  ip?: string
}

class Logger {
  private logToFile(entry: LogEntry) {
    const logLine = JSON.stringify(entry) + '\n'
    // In production, write to file or send to logging service
    console.log(logLine)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log({ level: 'debug', message, context })
  }

  info(message: string, context?: Record<string, any>) {
    this.log({ level: 'info', message, context })
  }

  warn(message: string, context?: Record<string, any>) {
    this.log({ level: 'warn', message, context })
  }

  error(message: string, context?: Record<string, any>) {
    this.log({ level: 'error', message, context })
  }

  private log(entry: Omit<LogEntry, 'timestamp'>) {
    this.logToFile({
      ...entry,
      timestamp: new Date().toISOString(),
    })
  }
}

export const logger = new Logger()
