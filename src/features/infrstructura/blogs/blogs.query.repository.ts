import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogViewModel } from "./models/blogs.models";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";
import { transformFirstLetter } from "../../../utils/upperFirstLetter";
import { Paginated } from "../../../common/paginated";

// outdated

export class BlogsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getBlogById(blogId: string): Promise<BlogViewModel | null> {
    // Blogs table
    const result = await this.dataSource.query(
      `
      SELECT "Id", "BlogName", "WebsiteUrl", "Description", "IsMembership", "CreatedAt"
      FROM public."Blogs"
          WHERE "Id" = $1`,
      [blogId],
    );

    if (result.length === 0) return null;

    return {
      name: result[0].BlogName,
      id: result[0].Id,
      websiteUrl: result[0].WebsiteUrl,
      createdAt: result[0].CreatedAt,
      description: result[0].Description,
      isMembership: result[0].IsMembership,
    };
  }

  async getBlogs(
    pageParams: PageSizeQueryModel,
  ): Promise<PaginationViewModel<BlogViewModel>> {
    const { sortBy, sortDirection, skip, pageSize, searchNameTerm } =
      pageParams;

    const orderBy =
      sortBy === "name"
        ? transformFirstLetter("blogName")
        : transformFirstLetter(sortBy);
    const result = await this.dataSource.query(
      `
        SELECT "Id", "BlogName", "WebsiteUrl", "Description", "IsMembership", "CreatedAt"
        FROM public."Blogs"
        WHERE "BlogName"  ILIKE $1
        ORDER BY "${orderBy}" ${sortDirection}
        LIMIT $2 OFFSET $3
      `,
      [`%${searchNameTerm}%`, pageSize, skip],
    );

    const count = await this.dataSource.query(
      `
      SELECT count (*)
      FROM public."Blogs"
      WHERE "BlogName"  ILIKE $1
    `,
      [`%${searchNameTerm}%`],
    );

    const mappedResult: BlogViewModel[] = result.map((r) => ({
      name: r.BlogName,
      id: r.Id,
      websiteUrl: r.WebsiteUrl,
      createdAt: r.CreatedAt,
      description: r.Description,
      isMembership: r.IsMembership,
    }));

    return Paginated.transformPagination<BlogViewModel>(
      {
        ...pageParams,
        totalCount: +count[0].count,
      },
      mappedResult,
    );
  }
}
