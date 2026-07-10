import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ForumsModule } from './forums/forums.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './infra/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ForumsModule,
    PostsModule,
  ],
})
export class AppModule {}
