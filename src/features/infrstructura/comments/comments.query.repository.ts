import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentViewModel } from "./models/comments.models";
import { PageSizeQueryModel } from "../../../common/types";
import { transformFirstLetter } from "../../../utils/upperFirstLetter";
import { Paginated } from "../../../common/paginated";

// outdated
export class CommentsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getCommentById(
    commentId: string,
    userId: string | null,
  ): Promise<CommentViewModel | null> {
    const result = await this.dataSource.query(
      `    
      SELECT "Id", "Content", "UserId", "UserLogin", "CreatedAt", "PostId",
      (SELECT "LikeStatus" FROM public."CommentLikesStatuses" 
       WHERE public."CommentLikesStatuses"."UserId" = $2 AND public."CommentLikesStatuses"."CommentId" = $1) as "UserStatus",
       (SELECT count(*) FROM public."CommentLikesStatuses" 
       WHERE public."CommentLikesStatuses"."LikeStatus" = 'Like' AND public."CommentLikesStatuses"."CommentId" = $1) as "LikesCount",
       (SELECT count(*) FROM public."CommentLikesStatuses" 
       WHERE public."CommentLikesStatuses"."LikeStatus" = 'Dislike' AND public."CommentLikesStatuses"."CommentId" = $1) as "DislikesCount"
      FROM public."Comments" as c
      WHERE "Id" = $1`,
      [commentId, userId],
    );

    // const result = []

    if (!result.length) return null;

    return {
      id: result[0].Id,
      content: result[0].Content,
      commentatorInfo: {
        userId: result[0].UserId,
        userLogin: result[0].UserLogin,
      },
      createdAt: result[0].CreatedAt,
      likesInfo: {
        likesCount: +result[0].LikesCount,
        dislikesCount: +result[0].DislikesCount,
        myStatus: result[0].UserStatus ? result[0].UserStatus : "None",
      },
    };
  }

  async getCommentsByPostId(
    postId: string,
    userId: string | null,
    pageParams: PageSizeQueryModel,
  ) {
    const { sortBy, sortDirection, skip, pageSize } = pageParams;
    const orderBy = transformFirstLetter(sortBy);

    const result = await this.dataSource.query(
      `    
      SELECT c.*,
      (SELECT COUNT(*)
      FROM public."CommentLikesStatuses" commentsikes
      WHERE commentsikes."CommentId" = c."Id" AND commentsikes."LikeStatus" = 'Like') AS "LikesCount",
      (SELECT COUNT(*)
      FROM public."CommentLikesStatuses" commentsikes
      WHERE commentsikes."CommentId" = c."Id" AND commentsikes."LikeStatus" = 'Dislike') AS "DislikesCount",
      (SELECT "LikeStatus" 
      FROM public."CommentLikesStatuses" commentsikes
      WHERE commentsikes."CommentId" = c."Id" AND commentsikes."UserId" = $4 AND commentsikes."PostId" = $1) as "UserStatus"
  FROM public."Comments" as c
  WHERE c."PostId" = $1
  ORDER BY "${orderBy}" ${sortDirection}
  LIMIT $2 OFFSET $3`,
      [postId, pageSize, skip, userId],
    );

    const count = await this.dataSource.query(
      `
      SELECT count (*)
      FROM public."Comments"
      WHERE "PostId" = $1
    `,
      [postId],
    );

    const mappedComments = result.map((comment) => ({
      id: comment.Id,
      content: comment.Content,
      commentatorInfo: {
        userId: comment.UserId,
        userLogin: comment.UserLogin,
      },
      createdAt: comment.CreatedAt,
      likesInfo: {
        likesCount: +comment.LikesCount,
        dislikesCount: +comment.DislikesCount,
        myStatus: comment.UserStatus ? comment.UserStatus : "None",
      },
    }));

    return Paginated.transformPagination(
      {
        ...pageParams,
        totalCount: +count[0].count,
      },
      mappedComments,
    );
  }
}
