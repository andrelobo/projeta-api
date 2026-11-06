import { describe, expect, it } from 'vitest';
import { HealthService } from './health.service';
import type { HealthIndicator } from './health.types';

const mongodbUp: HealthIndicator = {
  name: 'mongodb',
  check: () => ({ status: 'up' }),
};

const redisUp: HealthIndicator = {
  name: 'redis',
  check: () => Promise.resolve({ status: 'up' }),
};

const redisDown: HealthIndicator = {
  name: 'redis',
  check: () => ({ status: 'down', message: 'timeout' }),
};

const broken: HealthIndicator = {
  name: 'storage',
  check: () => {
    throw new Error('falha inesperada');
  },
};

describe('HealthService', () => {
  it('reporta liveness sem consultar dependências', () => {
    const service = new HealthService([broken]);

    expect(service.liveness()).toEqual({ status: 'ok' });
  });

  it('marca ready quando todos os indicadores estão up', async () => {
    const service = new HealthService([mongodbUp, redisUp]);
    const report = await service.readiness();

    expect(report.status).toBe('ok');
    expect(report.checks['mongodb']).toMatchObject({ status: 'up' });
    expect(report.checks['redis']).toMatchObject({ status: 'up' });
  });

  it('marca ready como error quando uma dependência está down', async () => {
    const service = new HealthService([mongodbUp, redisDown]);
    const report = await service.readiness();

    expect(report.status).toBe('error');
    expect(report.checks['redis']).toMatchObject({ status: 'down', message: 'timeout' });
  });

  it('trata exceção do indicador como down', async () => {
    const service = new HealthService([broken]);
    const report = await service.readiness();

    expect(report.status).toBe('error');
    expect(report.checks['storage']).toMatchObject({ status: 'down', message: 'check failed' });
  });
});
