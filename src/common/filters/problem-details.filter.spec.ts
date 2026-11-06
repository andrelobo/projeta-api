import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ProblemDetailsFilter } from './problem-details.filter';
import type { ProblemDetails } from '../errors/problem-details';

interface MockResponse {
  setHeader: ReturnType<typeof vi.fn>;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
}

function createHost(request: Record<string, unknown>): {
  host: ArgumentsHost;
  response: MockResponse;
} {
  const response: MockResponse = {
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);

  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
}

function getBody(response: MockResponse): ProblemDetails {
  return response.json.mock.calls[0]?.[0] as ProblemDetails;
}

describe('ProblemDetailsFilter', () => {
  it('serializa HttpException no formato Problem Details', () => {
    const { host, response } = createHost({
      originalUrl: '/api/v1/projects/1',
      url: '/api/v1/projects/1',
      requestId: 'req-1',
    });

    new ProblemDetailsFilter().catch(
      new HttpException({ code: 'NOT_FOUND', detail: 'Projeto não encontrado.' }, 404),
      host,
    );

    expect(response.setHeader).toHaveBeenCalledWith('content-type', 'application/problem+json');
    expect(response.status).toHaveBeenCalledWith(404);
    expect(getBody(response)).toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      detail: 'Projeto não encontrado.',
      instance: '/api/v1/projects/1',
      requestId: 'req-1',
    });
  });

  it('preserva errors[] de validação', () => {
    const { host, response } = createHost({
      originalUrl: '/api/v1/projects',
      requestId: 'req-2',
    });

    new ProblemDetailsFilter().catch(
      new HttpException(
        {
          code: 'VALIDATION_ERROR',
          errors: [{ field: 'title', code: 'too_small', message: 'mínimo 3 caracteres' }],
        },
        422,
      ),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(422);
    expect(getBody(response).errors).toEqual([
      { field: 'title', code: 'too_small', message: 'mínimo 3 caracteres' },
    ]);
  });

  it('não vaza a mensagem de exceção desconhecida', () => {
    const loggerSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { host, response } = createHost({
      originalUrl: '/api/v1/projects',
      requestId: 'req-3',
    });

    new ProblemDetailsFilter().catch(new Error('segredo interno do banco'), host);

    const body = getBody(response);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(body.detail).not.toContain('segredo interno');

    loggerSpy.mockRestore();
  });

  it('gera requestId quando a requisição chega sem middleware', () => {
    const { host, response } = createHost({ originalUrl: '/health/live' });

    new ProblemDetailsFilter().catch(new HttpException('indisponível', 503), host);

    expect(getBody(response).requestId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
