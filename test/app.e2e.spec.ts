import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/common/configure-app';
import { loadEnv } from '../src/config/env';

// Portas altas sem serviço: a readiness deve responder 503 de forma rápida.
Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '3999',
  MONGODB_URI: 'mongodb://127.0.0.1:65534/projeta',
  REDIS_URL: 'redis://127.0.0.1:65535',
  CORS_ORIGIN: 'http://localhost:3001',
  LOG_LEVEL: 'error',
});

describe('API shell (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: false, bodyParser: false });
    configureApp(app, loadEnv(process.env));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health/live responde 200 e devolve request id', async () => {
    const response = await request(app.getHttpServer()).get('/health/live').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('GET /health/ready responde 503 quando as dependências estão inacessíveis', async () => {
    const response = await request(app.getHttpServer()).get('/health/ready').expect(503);

    expect(response.body).toMatchObject({
      status: 'error',
      checks: {
        mongodb: { status: 'down' },
        redis: { status: 'down' },
      },
    });
  });

  it('preserva x-request-id válido enviado pelo cliente', async () => {
    const requestId = 'req-abc-123456';
    const response = await request(app.getHttpServer())
      .get('/health/live')
      .set('x-request-id', requestId)
      .expect(200);

    expect(response.headers['x-request-id']).toBe(requestId);
  });

  it('resposta 404 segue Problem Details', async () => {
    const response = await request(app.getHttpServer()).get('/rota-inexistente').expect(404);

    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.body).toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      detail: 'O recurso solicitado não existe.',
      instance: '/rota-inexistente',
    });
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
  });
});
