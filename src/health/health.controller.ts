import { Controller, Get, HttpStatus, Inject, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService } from './health.service';
import type { LivenessResponse, ReadinessResponse } from './health.types';

@Controller('health')
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get('live')
  liveness(): LivenessResponse {
    return this.healthService.liveness();
  }

  @Get('ready')
  async readiness(@Res({ passthrough: true }) response: Response): Promise<ReadinessResponse> {
    const report = await this.healthService.readiness();

    response.status(report.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);

    return report;
  }
}
