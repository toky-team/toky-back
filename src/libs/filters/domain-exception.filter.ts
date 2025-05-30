import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';

import { DomainException } from '~/libs/exceptions/domain-exception';
import { DateUtil } from '~/libs/utils/date.util';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter<DomainException> {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.statusCode;

    response.status(status).json({
      timestamp: DateUtil.formatDate(DateUtil.now()),
      path: request.url,
      error: exception.name,
      message: exception.message,
    });
  }
}
