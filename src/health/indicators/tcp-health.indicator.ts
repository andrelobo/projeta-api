import { createConnection } from 'node:net';
import type { HealthCheckResult, HealthIndicator } from '../health.types';

export interface TcpHealthIndicatorOptions {
  name: string;
  host: string;
  port: number;
  timeoutMs?: number;
}

/**
 * Indicador de disponibilidade por conexão TCP.
 *
 * Verifica apenas se a porta aceita conexão — não autentica nem executa ping
 * no serviço. Os clientes reais de Mongo e Redis substituem este indicador
 * nos incrementos M0.5/M0.8, mantendo o mesmo contrato.
 */
export class TcpHealthIndicator implements HealthIndicator {
  readonly name: string;

  private readonly host: string;
  private readonly port: number;
  private readonly timeoutMs: number;

  constructor(options: TcpHealthIndicatorOptions) {
    this.name = options.name;
    this.host = options.host;
    this.port = options.port;
    this.timeoutMs = options.timeoutMs ?? 1000;
  }

  check(): Promise<HealthCheckResult> {
    return new Promise((resolve) => {
      const socket = createConnection({ host: this.host, port: this.port });
      let settled = false;

      const finish = (result: HealthCheckResult): void => {
        if (settled) {
          return;
        }

        settled = true;
        socket.destroy();
        resolve(result);
      };

      socket.setTimeout(this.timeoutMs);
      socket.once('connect', () => finish({ status: 'up' }));
      socket.once('timeout', () => finish({ status: 'down', message: 'timeout' }));
      socket.once('error', () => finish({ status: 'down', message: 'connection failed' }));
    });
  }
}

export function parseEndpoint(uri: string, defaultPort: number): { host: string; port: number } {
  const url = new URL(uri);

  return {
    host: url.hostname.replace(/^\[|\]$/g, ''),
    port: url.port ? Number(url.port) : defaultPort,
  };
}
