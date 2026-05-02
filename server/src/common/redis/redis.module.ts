import { Global, Module, OnApplicationShutdown, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL');
        if (!url) {
          throw new Error('REDIS_URL is not defined in environment');
        }

        const redis = new Redis(url, {
          maxRetriesPerRequest: 3,
          connectTimeout: 10000,
          enableReadyCheck: true,
          lazyConnect: false,
          retryStrategy: (times) => {
            if (times > 5) {
              console.error('[ERROR] Redis: Max retries reached. Stopping retries.');
              return null;
            }
            return Math.min(times * 200, 2000);
          },
        });

        redis.on('connect', () => console.log('[INFO] Redis connected'));
        redis.on('ready', () => console.log('[INFO] Redis ready'));
        redis.on('reconnecting', () => console.warn('[WARNING] Redis reconnecting...'));
        redis.on('error', (err) => console.error('[ERROR] Redis error:', err.message));
        redis.on('close', () => console.warn('[WARNING] Redis connection closed'));

        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async onApplicationShutdown() {
    await this.redis.quit();
    console.log('[WARNING] Redis disconnected gracefully');
  }
}
