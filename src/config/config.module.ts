import { Global, Module } from '@nestjs/common';
import { APP_CONFIG } from './config.constants';
import { loadEnv } from './env';

/**
 * Disponibiliza a configuração tipada via injeção de dependência.
 * A validação acontece na primeira resolução do provider e derruba o boot
 * se o ambiente estiver inválido.
 */
@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: () => loadEnv(process.env),
    },
  ],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}
