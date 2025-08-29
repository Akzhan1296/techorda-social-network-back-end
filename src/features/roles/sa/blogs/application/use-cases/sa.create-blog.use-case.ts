import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBlogDTO, ResultCreateBlogDTO } from "../sa.blogs.dto";
import { BlogsRepo } from "../../../../../infrstructura/blogs/blogs.adapter";
import { Blog } from "../../../../../entity/blogs-entity";

export class CreateBlogBySACommand {
  constructor(public createBlogDTO: CreateBlogDTO) {}
}

@CommandHandler(CreateBlogBySACommand)
export class CreateBlogBySAUseCase
  implements ICommandHandler<CreateBlogBySACommand>
{
  constructor(private readonly blogsRepo: BlogsRepo) {}

  async execute(command: CreateBlogBySACommand): Promise<ResultCreateBlogDTO> {
    const { description, websiteUrl, name } = command.createBlogDTO;

    const result: ResultCreateBlogDTO = {
      isBlogCreated: false,
      createdBlogId: null,
    };

    try {
      const newBlog = new Blog();
      newBlog.name = name;
      newBlog.websiteUrl = websiteUrl;
      newBlog.description = description;
      newBlog.createdAt = new Date();
      newBlog.isMembership = false;

      const savedBlog = await this.blogsRepo.saveBlog(newBlog);

      result.createdBlogId = savedBlog.id;
      result.isBlogCreated = true;
    } catch (err) {
      throw new Error(err);
    }
    return result;
  }
}
