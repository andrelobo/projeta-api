import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { requestIdMiddleware } from './request-id.middleware';

function createRequest(requestId?: string): Request {
  return {
    header: vi.fn().mockReturnValue(requestId),
  } as unknown as Request;
}

function createResponse(): Response {
  return {
    setHeader: vi.fn(),
  } as unknown as Response;
}

describe('requestIdMiddleware', () => {
  it('gera um UUID quando o cliente não envia identificador', () => {
    const request = createRequest();
    const response = createResponse();
    const next = vi.fn() as NextFunction;

    requestIdMiddleware(request, response, next);

    expect(request.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.setHeader).toHaveBeenCalledWith('x-request-id', request.requestId);
    expect(next).toHaveBeenCalledOnce();
  });

  it('preserva um identificador válido enviado pelo cliente', () => {
    const request = createRequest('req-abc-123456');
    const response = createResponse();
    const next = vi.fn() as NextFunction;

    requestIdMiddleware(request, response, next);

    expect(request.requestId).toBe('req-abc-123456');
    expect(response.setHeader).toHaveBeenCalledWith('x-request-id', 'req-abc-123456');
  });

  it('descarta identificadores com formato inválido', () => {
    const request = createRequest('curto');
    const response = createResponse();
    const next = vi.fn() as NextFunction;

    requestIdMiddleware(request, response, next);

    expect(request.requestId).not.toBe('curto');
    expect(request.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
