import { InjectRepository } from "@nestjs/typeorm";
import { Blog } from "../../entity/blogs-entity";
import { Repository } from "typeorm";
import { BlogViewModel } from "./models/blogs.models";
import { Paginated } from "../../../common/paginated";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";

export class BlogsQueryRepo {
  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>
  ) {}

  async getBlogById(blogId: string): Promise<BlogViewModel | null> {
    let resultView: null | BlogViewModel = null;

    const builder = await this.blogsRepository
      .createQueryBuilder()
      .where({ id: blogId })
      .getOne();

    if (builder) {
      const { name, createdAt, description, id, isMembership, websiteUrl } =
        builder;
      resultView = {
        name,
        id,
        websiteUrl,
        createdAt,
        description,
        isMembership,
      };
    }

    return resultView;
  }

  async getBlogs(
    pageParams: PageSizeQueryModel
  ): Promise<PaginationViewModel<BlogViewModel>> {
    const { sortBy, sortDirection, skip, pageSize, searchNameTerm } =
      pageParams;

    const blogs = await this.blogsRepository
      .createQueryBuilder()
      .select()
      .where('"name" ILIKE :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      })
      .orderBy(
        `"${sortBy}"`,
        `${sortDirection.toUpperCase()}` as "ASC" | "DESC"
      )
      .skip(skip)
      .take(pageSize)
      .getMany();

    const count = await this.blogsRepository
      .createQueryBuilder()
      .where('"name" ILIKE :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      })
      .getCount();

    return Paginated.transformPagination<BlogViewModel>(
      {
        ...pageParams,
        totalCount: +count,
      },
      blogs
    );
  }
}
