// redis.module.ts
import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      sharedConfig: {
        connection: {
          host: 'localhost',
          port: 6379,
        },
      },
    }),
  ],
  exports: [BullModule],
})
export class RedisModule {}
