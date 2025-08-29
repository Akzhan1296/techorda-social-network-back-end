import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateBlogDTO, UpdateBlogResultDTO } from "../sa.blogs.dto";
import { BlogsRepo } from "../../../../../infrstructura/blogs/blogs.adapter";

export class UpdateBlogBySACommand {
  constructor(public updateBlogDTO: UpdateBlogDTO) {}
}

@CommandHandler(UpdateBlogBySACommand)
export class UpdateBlogBySAUseCase
  implements ICommandHandler<UpdateBlogBySACommand>
{
  constructor(private blogsRepo: BlogsRepo) {}

  async execute(command: UpdateBlogBySACommand): Promise<UpdateBlogResultDTO> {
    const { blogId, description, name, websiteUrl } = command.updateBlogDTO;

    const result: UpdateBlogResultDTO = {
      isBlogFound: false,
      isBlogUpdated: false,
    };
    const blogData = await this.blogsRepo.findBlogById(blogId);
    if (!blogData) return result;
    result.isBlogFound = true;

    try {
      blogData.description = description;
      blogData.name = name;
      blogData.websiteUrl = websiteUrl;

      await this.blogsRepo.saveBlog(blogData);
      result.isBlogUpdated = true;
    } catch (err) {
      throw new Error(
        `Something went wrong during updating blog by id ${blogId} ${err}`,
      );
    }

    return result;
  }
}
