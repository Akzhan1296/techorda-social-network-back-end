import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateCommentDTO, UpdateCommentResult } from "../comments.dto";
import { CommentsRepo } from "../../../../../infrstructura/comments/comments.adapter";

export class UpdateCommentCommand {
  constructor(public updateCommentDTO: UpdateCommentDTO) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepo: CommentsRepo) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, userId, content } = command.updateCommentDTO;

    const result: UpdateCommentResult = {
      isCommentFound: false,
      isCommentUpdated: false,
      isForbidden: false,
    };

    const commentData = await this.commentsRepo.findCommentById(commentId);
    if (!commentData) return result;
    result.isCommentFound = true;

    if (commentData.userId !== userId) {
      result.isForbidden = true;
      return result;
    }

    try {
      commentData.content = content;
      await this.commentsRepo.saveComment(commentData);
      result.isCommentUpdated = true;
    } catch (err) {
      throw new Error(`Something went wrong with updating comment ${err}`);
    }

    return result;
  }
}
