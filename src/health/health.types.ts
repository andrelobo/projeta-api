export type HealthComponentStatus = 'up' | 'down';

export interface HealthCheckResult {
  status: HealthComponentStatus;
  message?: string;
}

export interface HealthCheckReport {
  status: HealthComponentStatus;
  latencyMs: number;
  message?: string;
}

export interface LivenessResponse {
  status: 'ok';
}

export interface ReadinessResponse {
  status: 'ok' | 'error';
  checks: Record<string, HealthCheckReport>;
}

export interface HealthIndicator {
  readonly name: string;
  check(): Promise<HealthCheckResult> | HealthCheckResult;
}
