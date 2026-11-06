import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const VALID_REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;

/**
 * Garante um identificador de correlação por requisição.
 *
 * Um valor válido enviado pelo cliente é preservado; qualquer outro valor é
 * descartado para evitar injeção de cabeçalho. O id aparece na resposta e,
 * a partir do M0.6, nos logs estruturados.
 */
export function requestIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const incoming = request.header('x-request-id');
  const requestId = incoming && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();

  request.requestId = requestId;
  response.setHeader('x-request-id', requestId);

  next();
}
