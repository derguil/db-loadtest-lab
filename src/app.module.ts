import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ForumsModule } from './forums/forums.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ForumsModule, PostsModule,
  ],
})
export class AppModule {}
