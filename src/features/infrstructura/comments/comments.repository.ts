import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import {
  CommentDataView,
  GetCommentLikeDataDTO,
  CreateCommentType,
  SetCommentLikeEntityDto,
  UpdateCommentLikeEntityDto,
  UpdateCommentType,
} from "./models/comments.models";

// outdated
export class CommentsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createCommentForPost(
    createCommentDTO: CreateCommentType,
  ): Promise<string> {
    const { createdAt, content, postId, userId, userLogin } = createCommentDTO;

    const result = await this.dataSource.query(
      `INSERT INTO public."Comments"(
        "Content", "UserId", "UserLogin", "CreatedAt",  "PostId")
          VALUES ($1, $2, $3, $4, $5)
        RETURNING "Id"`,
      [content, userId, userLogin, createdAt, postId],
    );

    return result[0].Id;
  }

  async getCommentEntityById(
    commentId: string,
  ): Promise<CommentDataView | null> {
    const result = await this.dataSource.query(
      `    
      SELECT "Id", "Content", "UserId", "UserLogin", "CreatedAt", "PostId"
      FROM public."Comments"
      WHERE "Id" = $1`,
      [commentId],
    );

    if (result.length === 0) return null;

    return {
      id: result[0].Id,
      content: result[0].Content,
      userId: result[0].UserId,
      userLogin: result[0].UserLogin,
      createdAt: result[0].CreatedAt,
      postId: result[0].PostId,
    };
  }

  async deleteCommentById(commentId: string) {
    const result = await this.dataSource.query(
      ` 
	      DELETE FROM public."Comments"
	      WHERE "Id" = $1
        `,
      [commentId],
    );

    return !!result[1];
  }

  async updateCommentById(updateCommentDTO: UpdateCommentType) {
    const { commentId, content } = updateCommentDTO;

    const result = await this.dataSource.query(
      `UPDATE public."Comments"
        SET "Content"= $2
        WHERE "Id" = $1`,
      [commentId, content],
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  // comments likes
  async getCommentLikeData(
    getCommentLikeDto: GetCommentLikeDataDTO,
  ): Promise<null | string> {
    const { commentId, userId } = getCommentLikeDto;
    const result = await this.dataSource.query(
      `    
      SELECT "Id"
      FROM public."CommentLikesStatuses"
      WHERE "CommentId" = $1 AND "UserId" = $2`,
      [commentId, userId],
    );
    if (result.length === 0) return null;
    return result[0].Id;
  }

  async isAnyCommentLikesData(commentId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `    
      SELECT "Id", "CommentId", "LikeStatus", "PostId", "UserId", "CreatedAt"
      FROM public."CommentLikesStatuses"
      WHERE "CommentId" = $1`,
      [commentId],
    );
    return result.length > 0 ? true : false;
  }

  async createCommentLikeEntity(
    setCommentLikeEntityDto: SetCommentLikeEntityDto,
  ): Promise<string> {
    const { commentId, createdAt, likeStatus, postId, userId } =
      setCommentLikeEntityDto;

    const result = await this.dataSource.query(
      `INSERT INTO public."CommentLikesStatuses"(
          "CommentId", "LikeStatus", "PostId", "UserId", "CreatedAt")
            VALUES ($1, $2, $3, $4, $5)
          RETURNING "Id"`,
      [commentId, likeStatus, postId, userId, createdAt],
    );

    return result[0].Id;
  }

  async updateCommentLikeEntity(
    updateCommentLike: UpdateCommentLikeEntityDto,
  ): Promise<boolean> {
    const { likeEntityId, likeStatus } = updateCommentLike;

    const result = await this.dataSource.query(
      `UPDATE public."CommentLikesStatuses"
      SET "LikeStatus"= $2
      WHERE "Id" = $1`,
      [likeEntityId, likeStatus],
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  async deleteCommentLikeEntities(commentId: string) {
    return await this.dataSource.query(
      ` 
	      DELETE FROM public."CommentLikesStatuses"
	      WHERE "CommentId" = $1
        `,
      [commentId],
    );
  }
}
