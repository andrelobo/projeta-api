import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { AppConfig } from '../config/env';
import { ProblemDetailsFilter } from './filters/problem-details.filter';
import { requestIdMiddleware } from './http/request-id.middleware';

/**
 * Configuração HTTP compartilhada entre o bootstrap e os testes E2E.
 *
 * A aplicação é criada com `bodyParser: false`; aqui registramos apenas o
 * parser JSON com limite de 1 MB (SPEC-000 §7).
 */
export function configureApp(app: INestApplication, config: AppConfig): INestApplication {
  const expressApp = app as NestExpressApplication;

  app.use(requestIdMiddleware);
  expressApp.useBodyParser('json', { limit: '1mb' });
  app.enableCors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  });
  app.useGlobalFilters(new ProblemDetailsFilter());
  app.enableShutdownHooks();

  const httpAdapter = app.getHttpAdapter().getInstance() as {
    disable?: (setting: string) => void;
  };
  httpAdapter.disable?.('x-powered-by');

  return app;
}
