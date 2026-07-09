import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Forum } from '../generated/prisma/client';
import { CreateForumDto } from './dto/create-forum.dto';
import { ForumRepository } from './forum.repository';
import { GetForumsDto } from './dto/get-forums.dto';

@Injectable()
export class ForumsService {
  constructor(private readonly forumRepository: ForumRepository) {}

  async addForum(createForumDto: CreateForumDto): Promise<Forum> {
    const { userId, title } = createForumDto;

    try {
      return await this.forumRepository.createForum({
        userId,
        title,
      });
    } catch (error: unknown) {
      if ((error as any).code === 'P2002') {
        const target = (error as any).meta?.target as string[] | undefined;

        if (target?.includes('title')) {
          throw new ConflictException('Forum title already exists.');
        }
        throw new ConflictException('Duplicate value exists.');
      }
      throw error;
    }
  }

  async getForums(getForumsDto: GetForumsDto): Promise<Forum[]> {
    const page = Number(getForumsDto.page ?? 1);
    const limit = Number(getForumsDto.limit ?? 10);

    return this.forumRepository.findForums(page, limit);
  }

  async getForumById(forumId: number): Promise<Forum> {
    const forum = await this.forumRepository.findByForumId(forumId);
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }
    return forum;
  }
}
