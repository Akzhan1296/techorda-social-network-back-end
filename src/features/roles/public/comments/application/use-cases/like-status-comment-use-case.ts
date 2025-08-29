import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HandleCommentLikeResult, HandleLikeCommentDTO } from "../comments.dto";
import { CommentsRepo } from "../../../../../infrstructura/comments/comments.adapter";
import { CommentLike } from "../../../../../entity/comment-likes-entity";

export class HandleCommentsLikesCommand {
  constructor(public likeCommentDto: HandleLikeCommentDTO) {}
}

@CommandHandler(HandleCommentsLikesCommand)
export class LikeStatusCommentUseCase
  implements ICommandHandler<HandleCommentsLikesCommand>
{
  constructor(
    private commentsRepo: CommentsRepo
  ) {}

  async execute(command: HandleCommentsLikesCommand) {
    const { commentId, userId, commentLikeStatus } = command.likeCommentDto;

    const result: HandleCommentLikeResult = {
      isCommentFound: false,
      isLikeStatusUpdated: false,
      isLikeStatusCreated: false,
    };

    // if no comment return not found
    const commentData = await this.commentsRepo.findCommentById(commentId);
    if (!commentData) {
      return result;
    }
    result.isCommentFound = true;

    // check comment like entity, do we have it for current user ?
    const commentLikeEntity = await this.commentsRepo.findCommentLikeData({
      userId,
      commentId,
    });

    // if we don't have for current user, any comment like entity, create it
    if (!commentLikeEntity) {
      try {
        const newComment = new CommentLike();
        newComment.commentId = commentId;
        newComment.userId = userId;
        newComment.likeStatus = commentLikeStatus;
        newComment.postId = commentData.postId;
        newComment.createdAt = new Date();

        await this.commentsRepo.saveCommentLike(newComment);

        result.isLikeStatusCreated = true;
      } catch (err) {
        throw new Error(`Something went product with like handle ${err}`);
      }
    } else {
      try {
        // if we have for current user comment like entity, just update like status
        commentLikeEntity.likeStatus = commentLikeStatus;
        await this.commentsRepo.saveCommentLike(commentLikeEntity);

        result.isLikeStatusUpdated = true;
      } catch (err) {
        throw new Error(`Something went product with like handle ${err}`);
      }
    }

    return result;
  }
}
