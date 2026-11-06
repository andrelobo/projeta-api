declare global {
  namespace Express {
    interface Request {
      /**
       * Identificador de correlação da requisição.
       * Preenchido por `requestIdMiddleware` antes do roteamento.
       */
      requestId?: string;
    }
  }
}

export {};
