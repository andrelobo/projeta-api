import { createServer } from 'node:net';
import type { AddressInfo, Server } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TcpHealthIndicator, parseEndpoint } from './tcp-health.indicator';

let server: Server;
let openPort: number;

beforeAll(async () => {
  server = createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  openPort = (server.address() as AddressInfo).port;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe('TcpHealthIndicator', () => {
  it('reporta up quando a porta aceita conexão', async () => {
    const indicator = new TcpHealthIndicator({
      name: 'mongodb',
      host: '127.0.0.1',
      port: openPort,
      timeoutMs: 500,
    });

    await expect(indicator.check()).resolves.toEqual({ status: 'up' });
  });

  it('reporta down quando a porta está fechada', async () => {
    const temporary = createServer();
    await new Promise<void>((resolve) => temporary.listen(0, '127.0.0.1', resolve));
    const closedPort = (temporary.address() as AddressInfo).port;
    await new Promise<void>((resolve, reject) => {
      temporary.close((error) => (error ? reject(error) : resolve()));
    });

    const indicator = new TcpHealthIndicator({
      name: 'redis',
      host: '127.0.0.1',
      port: closedPort,
      timeoutMs: 500,
    });

    await expect(indicator.check()).resolves.toEqual({
      status: 'down',
      message: 'connection failed',
    });
  });
});

describe('parseEndpoint', () => {
  it('extrai host e porta explícita', () => {
    expect(parseEndpoint('redis://cache.internal:6380', 6379)).toEqual({
      host: 'cache.internal',
      port: 6380,
    });
  });

  it('usa a porta padrão quando a URL não informa', () => {
    expect(parseEndpoint('mongodb+srv://cluster.example.net/projeta', 27017)).toEqual({
      host: 'cluster.example.net',
      port: 27017,
    });
  });
});
