import { Module } from '@nestjs/common';
import { APP_CONFIG } from '../config/config.constants';
import type { AppConfig } from '../config/env';
import { HealthController } from './health.controller';
import { HEALTH_INDICATORS } from './health.constants';
import { HealthService } from './health.service';
import type { HealthIndicator } from './health.types';
import { TcpHealthIndicator, parseEndpoint } from './indicators/tcp-health.indicator';

@Module({
  controllers: [HealthController],
  providers: [
    HealthService,
    {
      provide: HEALTH_INDICATORS,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig): HealthIndicator[] => [
        new TcpHealthIndicator({
          name: 'mongodb',
          ...parseEndpoint(config.MONGODB_URI, 27017),
        }),
        new TcpHealthIndicator({
          name: 'redis',
          ...parseEndpoint(config.REDIS_URL, 6379),
        }),
      ],
    },
  ],
})
export class HealthModule {}
