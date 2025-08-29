import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BlogsQueryType } from "../../../sa/blogs/api/sa.blogs.models";
import { PaginationViewModel, ValidId } from "../../../../../common/types";
import { PostViewModel } from "../../../../infrstructura/posts/models/posts.models";
import { AuthGuard } from "../../../../../guards/auth.guard";
import {
  CommentsQueryType,
  CreateCommentInputModel,
  PostLikeStatus,
} from "./input.models";
import { CommandBus } from "@nestjs/cqrs";
import { CreateCommentCommand } from "../../comments/application/use-cases/create-comment-use-case";
import { Request } from "express";
import { UserIdGuard } from "../../../../../guards/userId.guard";
import { CommentViewModel } from "../../../../infrstructura/comments/models/comments.models";
import { PostsQueryRepo } from "../../../../infrstructura/posts/posts.query.adapter";
import { CommentsQueryRepo } from "../../../../infrstructura/comments/comments.query.adapter";
import { HandlePostLikesCommand } from "../application/use-cases/handle-post-like-use-case";

@Controller("posts")
export class PublicPostsController {
  constructor(
    private postQuerysRepo: PostsQueryRepo,
    private commentsQueryRepo: CommentsQueryRepo,
    private commandBus: CommandBus,
    private postQueryRepo: PostsQueryRepo
  ) {}

  @Get("")
  @UseGuards(UserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPosts(
    @Req() request: Request,
    @Query() pageSize: BlogsQueryType
  ): Promise<PaginationViewModel<PostViewModel>> {
    return await this.postQueryRepo.getPosts(pageSize, request.body.userId);
  }

  // postId
  @Get(":id")
  @UseGuards(UserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPostById(@Req() request: Request, @Param() params: ValidId) {
    const post = await this.postQueryRepo.getPostByPostId(
      params.id,
      request.body.userId
    );
    if (!post) {
      throw new NotFoundException("post by id not found");
    }
    return post;
  }

  // get post comments
  // postId
  @Get(":id/comments")
  @UseGuards(UserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getCommentsPostById(
    @Req() request: Request,
    @Query() pageSize: CommentsQueryType,
    @Param() params: ValidId
  ) {
    const post = await this.postQuerysRepo.getPostByPostId(
      params.id,
      request.body.userId
    );

    if (!post) {
      throw new NotFoundException("comment by id not found");
    }

    const comments = await this.commentsQueryRepo.getCommentsByPostId(
      params.id,
      request.body.userId,
      pageSize
    );

    return comments;
  }

  // like-status
  // postId
  @Put(":id/like-status")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async postStatus(
    @Req() request: Request,
    @Param() params: ValidId,
    @Body() postLikeStatus: PostLikeStatus
  ) {
    const result = await this.commandBus.execute(
      new HandlePostLikesCommand({
        postId: params.id,
        postLikeStatus: postLikeStatus.likeStatus,
        userId: request.body.userId,
        userLogin: request.body.userLogin,
      })
    );

    if (!result.isPostFound) {
      throw new NotFoundException();
    }
    return;
  }

  // create comment
  @Post(":id/comments")
  @UseGuards(AuthGuard)
  @HttpCode(201)
  async createCommentForSelectedPost(
    @Req() request: Request,
    @Param() params: ValidId,
    @Body() commentInputModel: CreateCommentInputModel
  ): Promise<CommentViewModel> {
    const result = await this.commandBus.execute(
      new CreateCommentCommand({
        userId: request.body.userId,
        userLogin: request.body.userLogin,
        postId: params.id,
        content: commentInputModel.content,
      })
    );

    if (!result.isPostFound) {
      throw new NotFoundException("Post by this id not found");
    }

    if (result.isCommentCreated) {
      return this.commentsQueryRepo.getCommentById(
        result.commentId,
        request.body.userId
      );
    }
    return;
  }
}
