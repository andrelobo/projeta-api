import { describe, expect, it } from 'vitest';
import { ConfigValidationError, loadEnv } from './env';

const baseEnv: Record<string, string | undefined> = {
  MONGODB_URI: 'mongodb://localhost:27017/projeta',
  REDIS_URL: 'redis://localhost:6379',
  CORS_ORIGIN: 'http://localhost:3001',
};

describe('loadEnv', () => {
  it('carrega uma configuração válida e aplica os defaults', () => {
    const config = loadEnv(baseEnv);

    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(3000);
    expect(config.LOG_LEVEL).toBe('info');
    expect(config.MONGODB_URI).toBe(baseEnv['MONGODB_URI']);
  });

  it('aceita sobrescrita de defaults', () => {
    const config = loadEnv({
      ...baseEnv,
      NODE_ENV: 'production',
      PORT: '8080',
      LOG_LEVEL: 'warn',
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://otel-collector:4318',
    });

    expect(config.NODE_ENV).toBe('production');
    expect(config.PORT).toBe(8080);
    expect(config.LOG_LEVEL).toBe('warn');
    expect(config.OTEL_EXPORTER_OTLP_ENDPOINT).toBe('http://otel-collector:4318');
  });

  it('trata a variável opcional vazia como ausente', () => {
    const config = loadEnv({ ...baseEnv, OTEL_EXPORTER_OTLP_ENDPOINT: '' });

    expect(config.OTEL_EXPORTER_OTLP_ENDPOINT).toBeUndefined();
  });

  it('falha quando MONGODB_URI está ausente', () => {
    expect(() => loadEnv({ ...baseEnv, MONGODB_URI: undefined })).toThrow(ConfigValidationError);
    expect(() => loadEnv({ ...baseEnv, MONGODB_URI: undefined })).toThrow(/MONGODB_URI/);
  });

  it('não expõe o valor de um campo inválido na mensagem', () => {
    const secret = 'valor-super-secreto';

    try {
      loadEnv({ ...baseEnv, MONGODB_URI: secret });
      expect.unreachable('deveria ter falhado');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigValidationError);
      expect((error as Error).message).toContain('MONGODB_URI');
      expect((error as Error).message).not.toContain(secret);
    }
  });

  it('rejeita PORT fora do intervalo', () => {
    expect(() => loadEnv({ ...baseEnv, PORT: '70000' })).toThrow(/PORT/);
  });

  it('rejeita MONGODB_URI com esquema diferente de mongodb', () => {
    expect(() => loadEnv({ ...baseEnv, MONGODB_URI: 'http://localhost:27017' })).toThrow(
      /MONGODB_URI/,
    );
  });

  it('rejeita REDIS_URL com esquema diferente de redis', () => {
    expect(() => loadEnv({ ...baseEnv, REDIS_URL: 'http://localhost:6379' })).toThrow(/REDIS_URL/);
  });
});
