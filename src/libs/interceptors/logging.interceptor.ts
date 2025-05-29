import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start: number = Date.now();
    const req: Request = context.switchToHttp().getRequest<Request>();

    const { method, url } = req;
    const body = req.body as Record<string, unknown>;
    this.logger.log(`[HTTP Request] ${method} ${url}`);
    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Request Data:\n${JSON.stringify(body, null, 2)}`);
    }

    return next.handle().pipe(
      tap((response: unknown) => {
        const duration = Date.now() - start;
        this.logger.log(`[HTTP Response] ${method} ${url} (${duration}ms)`);
        this.logger.debug(`Response Data:\n${JSON.stringify(response, null, 2)}`);
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
