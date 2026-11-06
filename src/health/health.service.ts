import { Inject, Injectable } from '@nestjs/common';
import { HEALTH_INDICATORS } from './health.constants';
import type {
  HealthCheckReport,
  HealthIndicator,
  LivenessResponse,
  ReadinessResponse,
} from './health.types';

@Injectable()
export class HealthService {
  constructor(@Inject(HEALTH_INDICATORS) private readonly indicators: HealthIndicator[]) {}

  liveness(): LivenessResponse {
    return { status: 'ok' };
  }

  async readiness(): Promise<ReadinessResponse> {
    const checks: Record<string, HealthCheckReport> = {};

    await Promise.all(
      this.indicators.map(async (indicator) => {
        const startedAt = Date.now();

        try {
          const result = await indicator.check();
          checks[indicator.name] = {
            status: result.status,
            latencyMs: Date.now() - startedAt,
            ...(result.message ? { message: result.message } : {}),
          };
        } catch {
          checks[indicator.name] = {
            status: 'down',
            latencyMs: Date.now() - startedAt,
            message: 'check failed',
          };
        }
      }),
    );

    const status = Object.values(checks).every((check) => check.status === 'up') ? 'ok' : 'error';

    return { status, checks };
  }
}
