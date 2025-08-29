import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { Blog } from "../../entity/blogs-entity";

@Injectable()
export class BlogsRepo {
  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>
  ) {}

  async findBlogById(blogId: string): Promise<Blog | null> {
    return this.blogsRepository.findOneBy({ id: blogId });
  }

  async saveBlog(blog: Blog): Promise<Blog> {
    return this.blogsRepository.save(blog);
  }

  async deleteBlog(blog: Blog): Promise<DeleteResult> {
    return this.blogsRepository.delete(blog);
  }
}
