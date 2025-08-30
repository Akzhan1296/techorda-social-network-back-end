import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteBlogResultDTO } from "../sa.blogs.dto";
import { BlogsRepo } from "../../../../../infrstructura/blogs/blogs.adapter";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class DeleteBlogBySACommand {
  constructor(
    public deleteBlogDTO: {
      blogId: string;
    },
  ) {}
}

@CommandHandler(DeleteBlogBySACommand)
export class DeleteBlogBySAUseCase
  implements ICommandHandler<DeleteBlogBySACommand>
{
  constructor(
    private blogsRepo: BlogsRepo,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async execute(command: DeleteBlogBySACommand): Promise<DeleteBlogResultDTO> {
    const result: DeleteBlogResultDTO = {
      isBlogDeleted: false,
      isBlogFound: false,
    };

    const { blogId } = command.deleteBlogDTO;

    const blogData = await this.blogsRepo.findBlogById(blogId);
    if (!blogData) return result;

    result.isBlogFound = true;

    try {
      // Используем транзакцию для безопасного удаления всех связанных записей
      await this.dataSource.transaction(async (manager) => {
        // 1. Удаляем лайки комментариев для всех постов блога
        await manager.query(
          `DELETE FROM "comment_like" WHERE "postId" IN (SELECT "id" FROM "post" WHERE "blogId" = $1)`,
          [blogId]
        );

        // 2. Удаляем комментарии для всех постов блога
        await manager.query(
          `DELETE FROM "comment" WHERE "postId" IN (SELECT "id" FROM "post" WHERE "blogId" = $1)`,
          [blogId]
        );

        // 3. Удаляем лайки постов блога
        await manager.query(
          `DELETE FROM "post_like" WHERE "postId" IN (SELECT "id" FROM "post" WHERE "blogId" = $1)`,
          [blogId]
        );

        // 4. Удаляем посты блога
        await manager.query(`DELETE FROM "post" WHERE "blogId" = $1`, [blogId]);

        // 5. Удаляем сам блог
        await manager.query(`DELETE FROM "blog" WHERE "id" = $1`, [blogId]);
      });

      result.isBlogDeleted = true;
    } catch (err) {
      throw new Error(`Something went wrong with deleting blog: ${err}`);
    }

    return result;
  }
}
