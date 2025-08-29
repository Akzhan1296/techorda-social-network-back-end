import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCommentDTO, DeleteCommentResult } from "../comments.dto";
import { CommentsRepo } from "../../../../../infrstructura/comments/comments.adapter";

export class DeleteCommentCommand {
  constructor(public deleteCommentDTO: DeleteCommentDTO) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentsRepo: CommentsRepo) {}

  async execute(command: DeleteCommentCommand) {
    const { commentId, userId } = command.deleteCommentDTO;

    const result: DeleteCommentResult = {
      isCommentFound: false,
      isCommentDeleted: false,
      isForbidden: false,
    };

    const commentData = await this.commentsRepo.findCommentById(commentId);
    if (!commentData) return result;
    result.isCommentFound = true;

    if (commentData.userId !== userId) {
      result.isForbidden = true;
      return result;
    }

    const isAnyCommentLikesData =
      await this.commentsRepo.isAnyCommentLikesData(commentId);

    if (isAnyCommentLikesData) {
      try {
        await this.commentsRepo.deleteCommentLikeEntities(commentId);
      } catch (err) {
        throw new Error(
          `Something went wrong with deleting comments likes entity ${err}`,
        );
      }
    }

    try {
      const commentDeleteResult =
        await this.commentsRepo.deleteComment(commentData);

      result.isCommentDeleted = !!commentDeleteResult.affected;
    } catch (err) {
      throw new Error(
        `Something went wrong with deleting comment entity ${err}`
      );
    }

    return result;
  }
}
