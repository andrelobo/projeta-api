import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './common/configure-app';
import { ConfigValidationError, loadEnv } from './config/env';

async function bootstrap(): Promise<void> {
  // Fail-fast: valida o ambiente antes de criar a aplicação Nest.
  const config = loadEnv(process.env);

  const app = await NestFactory.create(AppModule, { bodyParser: false });
  configureApp(app, config);

  await app.listen(config.PORT);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  const message = error instanceof ConfigValidationError ? error.message : 'Falha ao iniciar a API';

  logger.error(message);
  process.exitCode = 1;
});
