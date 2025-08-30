import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BlogsQueryType } from "../../../sa/blogs/api/sa.blogs.models";
import {
  PageSizeQueryModel,
  PaginationViewModel,
  ValidId,
} from "../../../../../common/types";
import { PostViewModel } from "../../../../infrstructura/posts/models/posts.models";
import { UserIdGuard } from "../../../../../guards/userId.guard";
import { Request } from "express";
import { BlogsQueryRepo } from "../../../../infrstructura/blogs/blogs.query.adapter";
import { PostsQueryRepo } from "../../../../infrstructura/posts/posts.query.adapter";

@Controller("blogs")
export class PublicBlogsController {
  constructor(
    private postQueryRepo: PostsQueryRepo,
    private blogsQueryRepo: BlogsQueryRepo
  ) {}

  @Get("")
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Query() pageSize: BlogsQueryType) {
    return await this.blogsQueryRepo.getBlogs(pageSize);
  }

  // blogId
  @Get(":id/posts")
  @UseGuards(UserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getBlogPostsgetBlogById(
    @Req() request: Request,
    @Query() pageSize: BlogsQueryType,
    @Param() params: ValidId
  ): Promise<PaginationViewModel<PostViewModel>> {
    const blog = await this.blogsQueryRepo.getBlogById(params.id);
    if (!blog) {
      throw new NotFoundException("posts by blogId not found");
    }
    return await this.postQueryRepo.getPostsByBlogId(
      {
        ...pageSize,
        skip: pageSize.skip,
        blogId: params.id,
      } as PageSizeQueryModel,
      request.body.userId
    );
  }

  // blogId
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async getBlogById(@Param() params: ValidId) {
    const blog = await this.blogsQueryRepo.getBlogById(params.id);
    if (!blog) {
      throw new NotFoundException("posts by blogId not found");
    }
    return blog;
  }
}
