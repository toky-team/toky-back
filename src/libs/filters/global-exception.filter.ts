import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { DomainException } from '~/libs/exceptions/domain-exception';
import { DomainExceptionFilter } from '~/libs/filters/domain-exception.filter';
import { DateUtil } from '~/libs/utils/date.util';

@Catch()
export class GlobalExceptionFilter extends DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof DomainException) {
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

    response.status(status).json({
      timestamp: DateUtil.formatDate(DateUtil.now()),
      path: request.url,
      error,
      message,
    });
  }
}
