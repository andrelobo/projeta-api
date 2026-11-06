import { randomUUID } from 'node:crypto';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { buildProblemDetails } from '../errors/problem-details';

/**
 * Filtro global de exceções: toda resposta de erro segue Problem Details
 * (RFC 9457) com `code`, `requestId` e, quando aplicável, `errors[]`.
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : 500;

    if (!isHttpException) {
      const stack = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error('Erro não tratado', stack);
    }

    const problem = buildProblemDetails({
      status,
      exceptionResponse: isHttpException ? exception.getResponse() : undefined,
      request,
      fallbackRequestId: randomUUID(),
    });

    response.setHeader('content-type', 'application/problem+json');
    response.status(status).json(problem);
  }
}
