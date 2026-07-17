import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../infra/prisma/prisma.service';
import { DbClient } from '../infra/prisma/prisma.DbClientType';

const postSelect = {
  id: true,
  userId: true,
  forumId: true,
  title: true,
  content: true,
  commentCount: true,
  voteCount: true,
  scrapCount: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
  deletedAt: true,
  forum: {
    select: {
      id: true,
      title: true,
    },
  },
} satisfies Prisma.PostSelect;

type PostListItem = Prisma.PostGetPayload<{
  select: typeof postSelect;
}>;

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPost(
    data: Prisma.PostUncheckedCreateInput,
    db: DbClient = this.prisma,
  ): Promise<PostListItem> {
    return db.post.create({
      data,
      select: postSelect,
    });
  }

  findPosts(forumId: number, page: number, limit: number, db: DbClient = this.prisma): Promise<PostListItem[]> {
    return db.post.findMany({
      where: { forumId, isDeleted: false },
      select: postSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findPostByPostId(postId: number, db: DbClient = this.prisma): Promise<PostListItem | null> {
    return db.post.findFirst({
      where: {
        id: postId,
        isDeleted: false,
      },
      select: postSelect,
    });
  }

  updatePost(
    postId: number,
    data: Prisma.PostUncheckedUpdateInput,
    db: DbClient = this.prisma,
  ): Promise<PostListItem> {
    return db.post.update({
      where: { id: postId },
      data,
      select: postSelect,
    });
  }

  softDeletePostByPostId(postId: number, db: DbClient = this.prisma): Promise<PostListItem> {
    return db.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      select: postSelect,
    });
  }

  // hardDeletePostByPostId(postId: number): Promise<PostListItem> {
  //   return this.prisma.post.delete({
  //     where: { id: postId },
  //     select: postSelect,
  //   });
  // }
}