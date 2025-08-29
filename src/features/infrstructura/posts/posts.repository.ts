import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import {
  CreatePostDTO,
  GetPostLikeDataDTO,
  OnlyPostDataView,
  SetPostLikeEntityDto,
  UpdatePostDTO,
  UpdatePostLikeEntityDto,
} from "./models/posts.models";

// outdated
export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findPostById(postId: string): Promise<OnlyPostDataView | null> {
    const result = await this.dataSource.query(
      `
      SELECT *
	  FROM public."Posts"
	  WHERE "Id" = $1`,
      [postId],
    );

    if (result.length === 0) return null;

    return {
      id: result[0].Id,
      title: result[0].Title,
      shortDescription: result[0].ShortDescription,
      content: result[0].Content,
      createdAt: result[0].CreatedAt,
    };
  }

  async createPost(createPostDTO: CreatePostDTO): Promise<string> {
    const { createdAt, blogId, content, shortDescription, title } =
      createPostDTO;

    const result = await this.dataSource.query(
      `INSERT INTO public."Posts"(
        "Title", "ShortDescription", "Content", "CreatedAt", "BlogId")
        VALUES ( $1, $2, $3, $4, $5)
        RETURNING "Id";
        `,
      [title, shortDescription, content, createdAt, blogId],
    );

    return result[0].Id;
  }

  async updatePostById(updatePostDTO: UpdatePostDTO): Promise<boolean> {
    const { content, postId, shortDescription, title } = updatePostDTO;

    const result = await this.dataSource.query(
      `UPDATE public."Posts"
        SET "Content"= $2, "ShortDescription" = $3, "Title" = $4
        WHERE "Id" = $1`,
      [postId, content, shortDescription, title],
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  async deletePostById(postId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      ` 
	      DELETE FROM public."Posts"
	      WHERE "Id" = $1
        `,
      [postId],
    );

    return !!result[1];
  }

  // like statuses
  async getPostLikeData(getPostLikeDto: GetPostLikeDataDTO): Promise<string> {
    const { postId, userId } = getPostLikeDto;
    const result = await this.dataSource.query(
      `    
      SELECT "Id"
      FROM public."PostsLikesStatuses"
      WHERE "PostId" = $1 AND "UserId" = $2`,
      [postId, userId],
    );
    if (result.length === 0) return null;
    return result[0].Id;
  }

  async isAnyPostLikesData(postId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `    
      SELECT "Id", "CommentId", "LikeStatus", "PostId", "UserId", "CreatedAt"
      FROM public."PostsLikesStatuses"
      WHERE "PostId" = $1`,
      [postId],
    );
    return result.length > 0 ? true : false;
  }

  async createPostLikeData(
    setPostLikeEntityDto: SetPostLikeEntityDto,
  ): Promise<string> {
    const { createdAt, likeStatus, postId, userId, userLogin } =
      setPostLikeEntityDto;

    const result = await this.dataSource.query(
      `INSERT INTO public."PostsLikesStatuses"(
        "PostId", "UserId", "CreatedAt", "LikeStatus", "UserLogin")
          VALUES ($1, $2, $3, $4, $5)
          RETURNING "Id"`,
      [postId, userId, createdAt, likeStatus, userLogin],
    );

    return result[0].Id;
  }

  async updatePostLikeEntity(
    updatePostLikeDto: UpdatePostLikeEntityDto,
  ): Promise<boolean> {
    const { postLikeEntityId, postLikeStatus } = updatePostLikeDto;

    const result = await this.dataSource.query(
      `UPDATE public."PostsLikesStatuses"
      SET "LikeStatus"= $2
      WHERE "Id" = $1`,
      [postLikeEntityId, postLikeStatus],
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  async deletePostLikeEntities(postId: string) {
    return await this.dataSource.query(
      ` 
	      DELETE FROM public."PostsLikesStatuses"
	      WHERE "PostId" = $1
        `,
      [postId],
    );
  }
}
