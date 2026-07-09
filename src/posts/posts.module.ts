import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostRepository } from './post.repository';
import { PrismaModule } from '../infra/prisma/prisma.module';
import { ForumsModule } from '../forums/forums.module';

@Module({
  imports: [PrismaModule, ForumsModule],
  controllers: [PostsController],
  providers: [PostsService, PostRepository],
  exports: [PostRepository],
})
export class PostsModule {}
