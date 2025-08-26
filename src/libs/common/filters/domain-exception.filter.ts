import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';

import { DomainException } from '~/libs/core/domain-core/exceptions/domain-exception';
import { ExceptionFormat } from '~/libs/interfaces/exception-format.interface';
import { DateUtil } from '~/libs/utils/date.util';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter<DomainException> {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.statusCode;

    const exceptionResponse: ExceptionFormat = {
      timestamp: DateUtil.format(DateUtil.now()),
      status,
      error: exception.name,
      message: exception.message,
      path: request.url,
    };

    response.status(status).json(exceptionResponse);
  }
}
