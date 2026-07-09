import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ForumsService } from './forums.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { GetForumsDto } from './dto/get-forums.dto';

@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Post()
  addForum(@Body() createForumDto: CreateForumDto) {
    return this.forumsService.addForum(createForumDto);
  }

  @Get()
  getForums(@Query() getForumsDto: GetForumsDto) {
    return this.forumsService.getForums(getForumsDto);
  }

  @Get('/:forumId')
  getForumById(@Param('forumId', ParseIntPipe) forumId: number) {
    return this.forumsService.getForumById(forumId);
  }
}

