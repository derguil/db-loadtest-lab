import { Module } from '@nestjs/common';
import { PrismaModule } from '../infra/prisma/prisma.module';
import { ForumsService } from './forums.service';
import { ForumsController } from './forums.controller';
import { ForumRepository } from './forum.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ForumsController],
  providers: [ForumsService, ForumRepository],
  exports: [ForumRepository],
})
export class ForumsModule {}
