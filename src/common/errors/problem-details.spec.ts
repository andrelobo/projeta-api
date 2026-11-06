import { describe, expect, it } from 'vitest';
import { buildProblemDetails } from './problem-details';

const request = {
  originalUrl: '/api/v1/projects',
  url: '/api/v1/projects',
  requestId: 'req-1',
};

describe('buildProblemDetails', () => {
  it('mapeia 422 com erros de campo', () => {
    const problem = buildProblemDetails({
      status: 422,
      exceptionResponse: {
        code: 'VALIDATION_ERROR',
        errors: [{ field: 'title', code: 'too_small', message: 'mínimo 3 caracteres' }],
      },
      request,
    });

    expect(problem).toMatchObject({
      type: 'https://projeta.app/errors/validation',
      status: 422,
      code: 'VALIDATION_ERROR',
      instance: '/api/v1/projects',
      requestId: 'req-1',
    });
    expect(problem.errors).toHaveLength(1);
  });

  it('ignora erros de campo com formato inválido', () => {
    const problem = buildProblemDetails({
      status: 422,
      exceptionResponse: { errors: [{ field: 1 }, 'texto'] },
      request,
    });

    expect(problem.errors).toBeUndefined();
  });

  it('usa detail genérico em erro 500 e não expõe a exceção', () => {
    const problem = buildProblemDetails({
      status: 500,
      exceptionResponse: { message: 'segredo interno do banco' },
      request,
    });

    expect(problem.code).toBe('INTERNAL_ERROR');
    expect(problem.detail).toBe('Ocorreu um erro inesperado. Tente novamente mais tarde.');
    expect(problem.detail).not.toContain('segredo interno');
  });

  it('usa fallback para status fora do catálogo', () => {
    const problem = buildProblemDetails({ status: 418, request });

    expect(problem.code).toBe('HTTP_418');
    expect(problem.type).toBe('about:blank');
  });

  it('usa requestId de fallback quando a requisição não tem id', () => {
    const problem = buildProblemDetails({
      status: 404,
      request: { originalUrl: '/x', requestId: undefined },
      fallbackRequestId: 'fallback-1',
    });

    expect(problem.requestId).toBe('fallback-1');
  });
});
