import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeletePostDTO, ResultDeletePostDTO } from "../../sa.posts.dto";
import { BlogsRepo } from "../../../../../../infrstructura/blogs/blogs.adapter";
import { PostsRepo } from "../../../../../../infrstructura/posts/posts.adapter";

export class DeletePostBySACommand {
  constructor(public deletePostDTO: DeletePostDTO) {}
}

@CommandHandler(DeletePostBySACommand)
export class DeletePostBySAUseCase
  implements ICommandHandler<DeletePostBySACommand>
{
  constructor(
    private blogsRepo: BlogsRepo,
    private postsRepo: PostsRepo
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

    const isAnyPostLikesData = await this.postsRepo.isAnyPostLikesData(postId);

    if (isAnyPostLikesData) {
      try {
        await this.postsRepo.deletePostLikeEntities(postId);
      } catch (err) {
        throw new Error(
          `Something went wrong with deleting posts likes entity ${err}`
        );
      }
    }

    const postData = await this.postsRepo.findPostById(postId);
    if (!postData) return result;
    result.isPostFound = true;

    try {
      const isPostDeleted = await this.postsRepo.deletePost(postData);
      result.isPostDeleted = !!isPostDeleted.affected;
    } catch (err) {
      throw new Error(`Something went wrong with deleting post ${err}`);
    }

    return result;
  }
}
