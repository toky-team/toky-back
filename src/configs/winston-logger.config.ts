import * as path from 'path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export class LoggerConfig {
  private static instance: winston.Logger;

  public static getInstance(): winston.Logger {
    if (!LoggerConfig.instance) {
      LoggerConfig.instance = LoggerConfig.createLogger();
    }
    return LoggerConfig.instance;
  }

  private static createLogger(): winston.Logger {
    const logDir = path.join(process.cwd(), 'logs');

    // 500번대 에러 전용 로그 파일 설정
    const errorTransport = new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
    });

    // 4xx 에러 전용 로그 파일 설정
    const warnTransport = new DailyRotateFile({
      filename: path.join(logDir, 'warn-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'warn',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format((info) => {
          // error 레벨은 제외 (별도 파일에 기록)
          return info.level === 'warn' ? info : false;
        })()
      ),
    });

    // 모든 로그를 위한 파일 설정
    const combinedTransport = new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
    });

    return winston.createLogger({
      level: 'info',
      defaultMeta: { service: 'toky-back' },
      transports: [errorTransport, warnTransport, combinedTransport],
      exceptionHandlers: [
        new DailyRotateFile({
          filename: path.join(logDir, 'exceptions-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
      rejectionHandlers: [
        new DailyRotateFile({
          filename: path.join(logDir, 'rejections-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }
}
