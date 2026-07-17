import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ForumsModule } from './forums/forums.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ForumsModule,
    PostsModule,
    CacheModule.register()
  ],
})
export class AppModule {}
