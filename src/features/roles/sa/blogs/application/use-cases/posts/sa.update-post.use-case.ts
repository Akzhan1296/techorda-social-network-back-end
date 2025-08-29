import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResultUpdatePostDTO, UpdatePostDTO } from "../../sa.posts.dto";
import { BlogsRepo } from "../../../../../../infrstructura/blogs/blogs.adapter";
import { PostsRepo } from "../../../../../../infrstructura/posts/posts.adapter";

export class UpdatePostBySACommand {
  constructor(public updatePostDTO: UpdatePostDTO) {}
}

@CommandHandler(UpdatePostBySACommand)
export class UpdatePostBySAUseCase
  implements ICommandHandler<UpdatePostBySACommand>
{
  constructor(
    private blogsRepo: BlogsRepo,
    private postsRepo: PostsRepo
  ) {}

  async execute(command: UpdatePostBySACommand): Promise<ResultUpdatePostDTO> {
    const { blogId, postId, content, shortDescription, title } =
      command.updatePostDTO;

    const result: ResultUpdatePostDTO = {
      isBlogFound: false,
      isPostFound: false,
      isPostUpdated: false,
    };

    const blogData = await this.blogsRepo.findBlogById(blogId);
    if (!blogData) return result;
    result.isBlogFound = true;

    const postData = await this.postsRepo.findPostById(postId);
    if (!postData) return result;
    result.isPostFound = true;

    try {
      postData.content = content;
      postData.shortDescription = shortDescription;
      postData.title = title;

      await this.postsRepo.savePost(postData);

      result.isPostUpdated = true;
    } catch (err) {
      throw new Error(`Something went wrong with updating post ${err}`);
    }

    return result;
  }
}
