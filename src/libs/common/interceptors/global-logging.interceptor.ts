import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class GlobalLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start: number = Date.now();
    const req: Request = context.switchToHttp().getRequest<Request>();

    const { method, url, query } = req;
    const body = req.body as Record<string, unknown>;
    this.logger.log(`[HTTP Request] ${method} ${url}`);
    if (query && Object.keys(query).length > 0) {
      this.logger.debug(`Query Params:\n${JSON.stringify(query, null, 2)}`);
    }
    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Request Data:\n${JSON.stringify(body, null, 2)}`);
    }

    return next.handle().pipe(
      tap((data: unknown) => {
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode = response.statusCode;
        const duration = Date.now() - start;
        this.logger.log(`[HTTP Response] (${statusCode}) ${method} ${url} (${duration}ms)`);
        this.logger.debug(
          `Response Data:\n${
            data === null || data === undefined
              ? '[Empty Response]'
              : typeof data === 'object'
                ? JSON.stringify(data, null, 2)
                : String(data)
          }`
        );
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - start;
        this.logger.error(`[HTTP Error] ${method} ${url} (${duration}ms)`);

        if (error instanceof Error) {
          this.logger.error(`Error Message: ${error.message}`);
          this.logger.error(`Stack Trace:\n${error.stack}`);
        } else {
          this.logger.error(`Error Object:\n${JSON.stringify(error, null, 2)}`);
        }

        return throwError(() => error);
      })
    );
  }
}
