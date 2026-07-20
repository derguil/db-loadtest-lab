import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { GetPostsDto } from './dto/get-posts.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  addPost(@Body() createPostDto: CreatePostDto) {
    return this.postsService.addPost(createPostDto);
  }

  // @UseInterceptors(CacheInterceptor)
  @Get()
  getPosts(@Query() getPostsDto: GetPostsDto) {
    return this.postsService.getPosts(getPostsDto);
  }

  @Get('/:postId')
  getPostById(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.getPostById(postId);
  }

  @Patch('/:postId')
  updatePost(@Param('postId', ParseIntPipe) postId: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePost(postId, updatePostDto);
  }

  @Delete('/:postId')
  removePost(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.softDeletePost(postId);
  }
}
