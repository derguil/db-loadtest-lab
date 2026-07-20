import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ForumsModule } from './forums/forums.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ForumsModule,
    PostsModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [createKeyv(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)],
        ttl: 60 * 1000,
      }),
    }),
  ],
})
export class AppModule {}
