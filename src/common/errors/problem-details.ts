export interface ProblemDetailsFieldError {
  field?: string;
  code: string;
  message: string;
}

/**
 * Corpo de erro no formato Problem Details (RFC 9457), com extensões do
 * PROJETA definidas na SPEC-000 §4.2.
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  requestId: string;
  errors?: ProblemDetailsFieldError[];
}

interface ProblemCatalogEntry {
  code: string;
  title: string;
  type: string;
  detail: string;
}

const PROBLEM_CATALOG: Readonly<Record<number, ProblemCatalogEntry>> = {
  400: {
    code: 'BAD_REQUEST',
    title: 'Requisição inválida',
    type: 'https://projeta.app/errors/bad-request',
    detail: 'A requisição não pôde ser interpretada.',
  },
  401: {
    code: 'UNAUTHORIZED',
    title: 'Não autenticado',
    type: 'https://projeta.app/errors/unauthorized',
    detail: 'É necessário autenticar-se para acessar este recurso.',
  },
  403: {
    code: 'FORBIDDEN',
    title: 'Acesso negado',
    type: 'https://projeta.app/errors/forbidden',
    detail: 'Você não tem permissão para acessar este recurso.',
  },
  404: {
    code: 'NOT_FOUND',
    title: 'Recurso não encontrado',
    type: 'https://projeta.app/errors/not-found',
    detail: 'O recurso solicitado não existe.',
  },
  409: {
    code: 'CONFLICT',
    title: 'Conflito',
    type: 'https://projeta.app/errors/conflict',
    detail: 'A operação conflita com o estado atual do recurso.',
  },
  422: {
    code: 'VALIDATION_ERROR',
    title: 'Dados inválidos',
    type: 'https://projeta.app/errors/validation',
    detail: 'Um ou mais campos são inválidos.',
  },
  429: {
    code: 'RATE_LIMITED',
    title: 'Muitas requisições',
    type: 'https://projeta.app/errors/rate-limited',
    detail: 'O limite de requisições foi excedido. Tente novamente em instantes.',
  },
  500: {
    code: 'INTERNAL_ERROR',
    title: 'Erro interno',
    type: 'https://projeta.app/errors/internal',
    detail: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  },
  503: {
    code: 'SERVICE_UNAVAILABLE',
    title: 'Serviço indisponível',
    type: 'https://projeta.app/errors/unavailable',
    detail: 'O serviço está temporariamente indisponível.',
  },
};

function fallbackEntry(status: number): ProblemCatalogEntry {
  return {
    code: `HTTP_${status}`,
    title: 'Erro na requisição',
    type: 'about:blank',
    detail: 'A requisição não pôde ser processada.',
  };
}

function isFieldError(value: unknown): value is ProblemDetailsFieldError {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record['code'] === 'string' &&
    typeof record['message'] === 'string' &&
    (record['field'] === undefined || typeof record['field'] === 'string')
  );
}

export interface BuildProblemDetailsInput {
  status: number;
  exceptionResponse?: unknown;
  request: {
    originalUrl?: string;
    url?: string;
    requestId?: string;
  };
  fallbackRequestId?: string;
}

/**
 * Converte a resposta de uma exceção em Problem Details.
 *
 * Regra de segurança: para status 500 o `detail` é sempre genérico; a
 * mensagem original da exceção nunca vaza para o cliente.
 */
export function buildProblemDetails(input: BuildProblemDetailsInput): ProblemDetails {
  const entry = PROBLEM_CATALOG[input.status] ?? fallbackEntry(input.status);

  let detail = entry.detail;
  let code = entry.code;
  let errors: ProblemDetailsFieldError[] | undefined;

  if (input.status !== 500) {
    const payload = input.exceptionResponse;

    if (typeof payload === 'string') {
      detail = payload;
    } else if (payload !== null && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;

      if (typeof record['detail'] === 'string') {
        detail = record['detail'];
      }

      if (typeof record['code'] === 'string') {
        code = record['code'];
      }

      if (Array.isArray(record['errors'])) {
        const parsed = record['errors'].filter(isFieldError);
        errors = parsed.length > 0 ? parsed : undefined;
      }
    }
  }

  const instance = input.request.originalUrl ?? input.request.url ?? '/';
  const requestId = input.request.requestId ?? input.fallbackRequestId ?? 'unknown';

  return {
    type: entry.type,
    title: entry.title,
    status: input.status,
    detail,
    instance,
    code,
    requestId,
    ...(errors ? { errors } : {}),
  };
}
