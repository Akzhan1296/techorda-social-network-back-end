import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCommentDTO, DeleteCommentResult } from "../comments.dto";
import { CommentsRepo } from "../../../../../infrstructura/comments/comments.adapter";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class DeleteCommentCommand {
  constructor(public deleteCommentDTO: DeleteCommentDTO) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private commentsRepo: CommentsRepo,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

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

    try {
      // Используем транзакцию для безопасного удаления всех связанных записей
      await this.dataSource.transaction(async (manager) => {
        // 1. Удаляем лайки комментария
        await manager.query(
          `DELETE FROM "comment_like" WHERE "commentId" = $1`,
          [commentId]
        );

        // 2. Удаляем сам комментарий
        await manager.query(`DELETE FROM "comment" WHERE "id" = $1`, [commentId]);
      });

      result.isCommentDeleted = true;
    } catch (err) {
      throw new Error(
        `Something went wrong with deleting comment entity: ${err}`
      );
    }

    return result;
  }
}
