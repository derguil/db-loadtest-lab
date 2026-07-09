import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../infra/prisma/prisma.service';
import { DbClient } from '../infra/prisma/prisma.DbClientType';

const forumSelect = {
  id: true,
  userId: true,
  title: true,
  createdAt: true,
} satisfies Prisma.ForumSelect;

type ForumListItem = Prisma.ForumGetPayload<{
  select: typeof forumSelect;
}>;

@Injectable()
export class ForumRepository {
  constructor(private readonly prisma: PrismaService) {}

  createForum(
    data: Prisma.ForumUncheckedCreateInput,
    db: DbClient = this.prisma,
  ): Promise<ForumListItem> {
    return db.forum.create({
      data,
      select: forumSelect,
    });
  }

  findForums(page: number, limit: number, db: DbClient = this.prisma): Promise<ForumListItem[]> {
    return db.forum.findMany({
      select: forumSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findByForumId(forumId: number, db: DbClient = this.prisma): Promise<ForumListItem | null> {
    return db.forum.findUnique({
      where: { id: forumId },
      select: forumSelect,
    });
  }
}