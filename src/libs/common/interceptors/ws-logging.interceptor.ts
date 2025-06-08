import { Injectable, Logger } from '@nestjs/common';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WSLoggingInterceptor {
  private readonly logger = new Logger('WebSocket');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const client = context.switchToWs().getClient<Socket>();
    const data = context.switchToWs().getData<unknown>();
    const handler = context.getHandler().name;

    this.logger.log(`[WS Request] ${client.id} - ${handler}`);
    this.logger.debug(`Request Data:\n${JSON.stringify(data, null, 2)}`);

    const start = Date.now();

    return next.handle().pipe(
      tap((response: unknown) => {
        const duration = Date.now() - start;
        this.logger.log(`[WS Response] ${client.id} - ${handler} (${duration}ms)`);
        this.logger.debug(
          `Response Data:\n${
            response === null || response === undefined
              ? '[Empty Response]'
              : typeof response === 'object'
                ? JSON.stringify(response, null, 2)
                : String(response)
          }`
        );
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - start;
        this.logger.error(`[WS Error] ${client.id} - ${handler} (${duration}ms)`);

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
