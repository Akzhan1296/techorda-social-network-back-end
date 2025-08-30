import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeletePostDTO, ResultDeletePostDTO } from "../../sa.posts.dto";
import { BlogsRepo } from "../../../../../../infrstructura/blogs/blogs.adapter";
import { PostsRepo } from "../../../../../../infrstructura/posts/posts.adapter";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class DeletePostBySACommand {
  constructor(public deletePostDTO: DeletePostDTO) {}
}

@CommandHandler(DeletePostBySACommand)
export class DeletePostBySAUseCase
  implements ICommandHandler<DeletePostBySACommand>
{
  constructor(
    private blogsRepo: BlogsRepo,
    private postsRepo: PostsRepo,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async execute(command: DeletePostBySACommand): Promise<ResultDeletePostDTO> {
    const { blogId, postId } = command.deletePostDTO;

    const result: ResultDeletePostDTO = {
      isBlogFound: false,
      isPostFound: false,
      isPostDeleted: false,
    };

    const blogData = await this.blogsRepo.findBlogById(blogId);
    if (!blogData) return result;
    result.isBlogFound = true;

    const postData = await this.postsRepo.findPostById(postId);
    if (!postData) return result;
    result.isPostFound = true;

    try {
      // Используем транзакцию для безопасного удаления всех связанных записей
      await this.dataSource.transaction(async (manager) => {
        // 1. Удаляем лайки комментариев поста
        await manager.query(
          `DELETE FROM "comment_like" WHERE "postId" = $1`,
          [postId]
        );

        // 2. Удаляем комментарии поста
        await manager.query(
          `DELETE FROM "comment" WHERE "postId" = $1`,
          [postId]
        );

        // 3. Удаляем лайки поста
        await manager.query(
          `DELETE FROM "post_like" WHERE "postId" = $1`,
          [postId]
        );

        // 4. Удаляем сам пост
        await manager.query(`DELETE FROM "post" WHERE "id" = $1`, [postId]);
      });

      result.isPostDeleted = true;
    } catch (err) {
      throw new Error(`Something went wrong with deleting post: ${err}`);
    }

    return result;
  }
}
