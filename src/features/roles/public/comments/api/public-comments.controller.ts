import {
  Body,
  Controller,
  Put,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Req,
  UseGuards,
  Delete,
  ForbiddenException,
} from "@nestjs/common";
import {
  CommentInputModelType,
  CommentLikeStatus,
} from "./comments.input.models";
import { AuthGuard } from "../../../../../guards/auth.guard";
import { CommandBus } from "@nestjs/cqrs";
import { Request } from "express";
import { HandleCommentsLikesCommand } from "../application/use-cases/like-status-comment-use-case";
import { CommentViewModel } from "../../../../infrstructura/comments/models/comments.models";
import { UserIdGuard } from "../../../../../guards/userId.guard";
import {
  DeleteCommentResult,
  HandleCommentLikeResult,
  UpdateCommentResult,
} from "../application/comments.dto";
import { DeleteCommentCommand } from "../application/use-cases/delete-comment-use-case";
import { UpdateCommentCommand } from "../application/use-cases/update-comment-use-case";
import { ValidId } from "../../../../../common/types";
import { CommentsQueryRepo } from "../../../../infrstructura/comments/comments.query.adapter";

@Controller("comments")
export class PublicCommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsQueryRepo: CommentsQueryRepo
  ) {}

  // commentId
  @UseGuards(UserIdGuard)
  @Get(":id")
  async getCommentById(
    @Req() request: Request,
    @Param() params: ValidId
  ): Promise<CommentViewModel> {
    const result = await this.commentsQueryRepo.getCommentById(
      params.id,
      request.body.userId
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  // commentId
  @Put(":id/like-status")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleCommentLikeStatus(
    @Req() request: Request,
    @Param() params: ValidId,
    @Body() commentLikeStatus: CommentLikeStatus
  ) {
    const result = await this.commandBus.execute<
      unknown,
      HandleCommentLikeResult
    >(
      new HandleCommentsLikesCommand({
        commentId: params.id,
        commentLikeStatus: commentLikeStatus.likeStatus,
        userId: request.body.userId,
      })
    );

    if (!result.isCommentFound) {
      throw new NotFoundException();
    }
  }

  // commentId
  @Delete(":id")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Req() request: Request,
    @Param() params: ValidId
  ): Promise<boolean> {
    const result = await this.commandBus.execute<unknown, DeleteCommentResult>(
      new DeleteCommentCommand({
        userId: request.body.userId,
        commentId: params.id,
      })
    );
    if (result.isForbidden) {
      throw new ForbiddenException();
    }
    if (!result.isCommentFound) {
      throw new NotFoundException();
    }
    return result.isCommentDeleted;
  }

  // commentId
  @Put(":id")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Req() request: Request,
    @Param() params: ValidId,
    @Body() commentInputModel: CommentInputModelType
  ): Promise<boolean> {
    const result = await this.commandBus.execute<unknown, UpdateCommentResult>(
      new UpdateCommentCommand({
        commentId: params.id,
        userId: request.body.userId,
        content: commentInputModel.content,
      })
    );
    if (result.isForbidden) {
      throw new ForbiddenException();
    }
    if (!result.isCommentFound) {
      throw new NotFoundException();
    }
    return result.isCommentUpdated;
  }
}
