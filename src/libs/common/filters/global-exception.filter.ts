import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { LoggerConfig } from '~/configs/winston-logger.config';
import { DomainExceptionFilter } from '~/libs/common/filters/domain-exception.filter';
import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { AuthenticatedRequest } from '~/libs/interfaces/authenticated-request.interface';
import { ExceptionFormat } from '~/libs/interfaces/exception-format.interface';
import { DateUtil } from '~/libs/utils/date.util';

@Catch()
export class GlobalExceptionFilter extends DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = LoggerConfig.getInstance();

  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof DomainException) {
      // DomainException도 HTTP 에러 로깅 처리 (4xx, 5xx)
      this.logHttpError(exception, host, 'Domain Exception');
      super.catch(exception, host);
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let error: string;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = exception.name;
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        message = Array.isArray(res.message) ? res.message.join(', ') : (res.message as string);
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = exception.name;
      message = exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Unknown Error';
      message = 'An unexpected error occurred';
    }

    const exceptionResponse: ExceptionFormat = {
      timestamp: DateUtil.format(DateUtil.now()),
      status,
      error,
      message,
      path: request.url,
    };

    // 모든 HTTP 에러 로깅 (4xx, 5xx)
    if (status >= 400) {
      this.logHttpError(exception, host, 'Server Error', { status, error, message });
    }

    response.status(status).json(exceptionResponse);
  }

  private logHttpError(
    exception: unknown,
    host: ArgumentsHost,
    errorType: string,
    errorDetails?: { status: number; error: string; message: string }
  ): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<AuthenticatedRequest>();

    let status: number;
    let error: string;
    let message: string;

    if (errorDetails) {
      ({ status, error, message } = errorDetails);
    } else if (exception instanceof DomainException) {
      status = exception.statusCode;
      error = exception.name;
      message = exception.message;
    } else {
      return; // 로깅할 정보가 없으면 종료
    }

    const errorLog = {
      timestamp: DateUtil.format(DateUtil.now()),
      status,
      error,
      message,
      path: request.url,
      method: request.method,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      requestId: request.headers['x-request-id'] || 'unknown',
      userId: request.user ? request.user.userId : undefined,
      stack: exception instanceof Error ? exception.stack : undefined,
      body: request.body,
      query: request.query,
      params: request.params,
    };

    // 로그 레벨 결정: 4xx는 warn, 5xx는 error
    if (status >= 500) {
      this.logger.error(`${errorType} (5xx)`, errorLog);
    } else if (status >= 400) {
      this.logger.warn(`${errorType} (4xx)`, errorLog);
    }
  }
}
