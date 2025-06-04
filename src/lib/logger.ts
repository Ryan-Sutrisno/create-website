type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private static instance: Logger
  private isDevelopment: boolean

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment) return

    const timestamp = new Date().toISOString()
    const logData = data ? JSON.stringify(data, null, 2) : ''

    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}${logData ? `\n${logData}` : ''}`)
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }
}

export const logger = Logger.getInstance() 