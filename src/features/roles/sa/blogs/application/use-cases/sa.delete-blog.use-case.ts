import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteBlogResultDTO } from "../sa.blogs.dto";
import { BlogsRepo } from "../../../../../infrstructura/blogs/blogs.adapter";

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
  constructor(private blogsRepo: BlogsRepo) {}

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
      await this.blogsRepo.deleteBlog(blogData);
      result.isBlogDeleted = true;
    } catch (err) {
      throw new Error(`Something went wrong with deleting blog${err}`);
    }

    return result;
  }
}
