import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePostDTO, ResultCreatePostDTO } from "../../sa.posts.dto";
import { PostsRepo } from "../../../../../../infrstructura/posts/posts.adapter";
import { BlogsRepo } from "../../../../../../infrstructura/blogs/blogs.adapter";
import { Post } from "../../../../../../entity/posts-entity";

export class CreatePostBySACommand {
  constructor(public createPostDTO: CreatePostDTO) {}
}

@CommandHandler(CreatePostBySACommand)
export class CreatePostBySAUseCase
  implements ICommandHandler<CreatePostBySACommand>
{
  constructor(
    private blogsRepo: BlogsRepo,
    private postsRepo: PostsRepo
  ) {}
  async execute(command: CreatePostBySACommand): Promise<ResultCreatePostDTO> {
    const { blogId, content, shortDescription, title } = command.createPostDTO;

    const result: ResultCreatePostDTO = {
      isBlogFound: false,
      isPostCreated: false,
      createdPostId: null,
    };

    const blogData = await this.blogsRepo.findBlogById(blogId);

    if (!blogData) return result;
    result.isBlogFound = true;

    try {
      const newPost = new Post();
      newPost.title = title;
      newPost.shortDescription = shortDescription;
      newPost.content = content;
      newPost.blogId = blogData.id;
      newPost.createdAt = new Date();

      const savedPost = await this.postsRepo.savePost(newPost);

      result.createdPostId = savedPost.id;
      result.isPostCreated = true;
    } catch (err) {
      throw new Error(`Something went wrong with creating posts ${err}`);
    }

    return result;
  }
}
