import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogViewModel, CreateBlogDTO, UpdateBlogDTO } from "./models/blogs.models";

// outdated
export class BlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findBlogById(blogId: string): Promise<BlogViewModel | null> {
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

  async createBlog(createBlogDTO: CreateBlogDTO): Promise<string> {
    const { createdAt, description, isMembership, name, websiteUrl } =
      createBlogDTO;
    const result = await this.dataSource.query(
      `INSERT INTO public."Blogs"(
        "BlogName", "WebsiteUrl", "Description", "IsMembership", "CreatedAt")
        VALUES ($1, $2, $3, $4, $5)
      RETURNING "Id"`,
      [name, websiteUrl, description, isMembership, createdAt],
    );

    return result[0].Id;
  }

  async updateBlogById(updateBlogDTO: UpdateBlogDTO): Promise<boolean> {
    const { blogId, description, name, websiteUrl } = updateBlogDTO;

    const result = await this.dataSource.query(
      `UPDATE public."Blogs"
        SET "Description"= $2, "BlogName" = $3, "WebsiteUrl" = $4
        WHERE "Id" = $1`,
      [blogId, description, name, websiteUrl],
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  async deleteBlogById(blogId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      ` 
	      DELETE FROM public."Blogs"
	      WHERE "Id" = $1
        `,
      [blogId],
    );

    return !!result[1];
  }
}
