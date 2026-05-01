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
              console.error('❌ Redis: Max retries reached. Stopping retries.');
              return null;
            }
            return Math.min(times * 200, 2000);
          },
        });

        redis.on('connect', () => console.log('✅ Redis connected'));
        redis.on('ready', () => console.log('✅ Redis ready'));
        redis.on('reconnecting', () => console.warn('⚠️ Redis reconnecting...'));
        redis.on('error', (err) => console.error('❌ Redis error:', err.message));
        redis.on('close', () => console.warn('🔴 Redis connection closed'));

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
    console.log('🔴 Redis disconnected gracefully');
  }
}
