import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { Post } from '../generated/prisma/client';
import { ForumRepository } from '../forums/forum.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class PostsService {
  constructor(
    private readonly forumRepository: ForumRepository,
    private readonly postRepository: PostRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async addPost(createPostDto: CreatePostDto): Promise<Post> {
    const { userId, forumId, title, content } = createPostDto;

    const forum = await this.forumRepository.findByForumId(forumId);
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return this.postRepository.createPost({
      userId,
      forumId,
      title,
      content,
    });
  }

  async getPosts(getPostsDto: GetPostsDto): Promise<Post[]> {
    const forumId = Number(getPostsDto.forumId);
    const page = Number(getPostsDto.page ?? 1);
    const limit = Number(getPostsDto.limit ?? 10);

    const cacheKey = `forumId:${forumId}:page:${page}:limit:${limit}`;
    const cached = (await this.cacheManager.get(cacheKey)) as Post[] | undefined;
    if (cached) return cached;

    const posts = await this.postRepository.findPosts(forumId, page, limit);
    await this.cacheManager.set(cacheKey, posts);
    return posts;
  }

  async getPostById(postId: number): Promise<Post> {
    const post = await this.postRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async updatePost(postId: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.postRepository.updatePost(postId, updatePostDto);
  }
  
  async softDeletePost(postId: number): Promise<Post> {
    const post = await this.postRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.postRepository.softDeletePostByPostId(postId);
  }
}
