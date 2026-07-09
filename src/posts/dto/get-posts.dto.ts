export class GetPostsDto {
  forumId?: number;
  page: number = 1;

  limit: number = 10;
}
