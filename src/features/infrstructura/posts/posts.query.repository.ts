import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PostViewModel } from "./models/posts.models";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";
import { transformFirstLetter } from "../../../utils/upperFirstLetter";
import { Paginated } from "../../../common/paginated";

// outdated
export class PostsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  private getMappedPostItems(result): PostViewModel[] {
    return result.map((r) => ({
      id: r.Id,
      title: r.Title,
      shortDescription: r.ShortDescription,
      content: r.Content,
      blogId: r.BlogId,
      blogName: r.BlogName,
      createdAt: r.CreatedAt,
      extendedLikesInfo: {
        likesCount: +r.LikesCount,
        dislikesCount: +r.DislikesCount,
        myStatus: r.UserLikeStatus ? r.UserLikeStatus : "None",
        newestLikes: r.NewestLikeCreatedAt ? r.NewestLikeCreatedAt : [],
      },
    }));
  }

  async getPostByPostId(
    postId: string,
    userId: string | null,
  ): Promise<PostViewModel | null> {
    const result = await this.dataSource.query(
      `	SELECT
  p.*,
  b."BlogName",
  (SELECT COUNT(*)
   FROM public."PostsLikesStatuses" postLikes
   WHERE postLikes."PostId" = p."Id" AND postLikes."LikeStatus" = 'Like') AS "LikesCount",
  (SELECT COUNT(*)
   FROM public."PostsLikesStatuses" postLikes
   WHERE postLikes."PostId" = p."Id" AND postLikes."LikeStatus" = 'Dislike') AS "DislikesCount",
  (SELECT "LikeStatus"
   FROM public."PostsLikesStatuses"
   WHERE "PostId" = p."Id" AND "UserId" = $2) AS "UserLikeStatus",


   
   (SELECT json_agg(json_build_object(
    'addedAt', "CreatedAt",
    'userId', "UserId",
    'login', "UserLogin"
))
FROM (
    SELECT DISTINCT ON ("UserId", "CreatedAt") "CreatedAt", "UserId", "UserLogin"
    FROM public."PostsLikesStatuses"
    WHERE "PostId" = p."Id" AND "LikeStatus" = 'Like'
    ORDER BY "CreatedAt" DESC
    LIMIT 3
) AS subquery
) AS "NewestLikeCreatedAt"


    FROM
      public."Posts" p
    LEFT JOIN
      public."Blogs" b ON p."BlogId" = b."Id"
    WHERE
      p."Id" = $1;
    
      `,
      [postId, userId],
    );

    if (!result.length) return null;

    return {
      id: result[0].Id,
      title: result[0].Title,
      shortDescription: result[0].ShortDescription,
      content: result[0].Content,
      blogId: result[0].BlogId,
      blogName: result[0].BlogName,
      createdAt: result[0].CreatedAt,
      extendedLikesInfo: {
        likesCount: +result[0].LikesCount,
        dislikesCount: +result[0].DislikesCount,
        myStatus: result[0].UserLikeStatus ? result[0].UserLikeStatus : "None",
        newestLikes: result[0].NewestLikeCreatedAt
          ? result[0].NewestLikeCreatedAt
          : [],
      },
    };
  }

  async getPostsByBlogId(
    pageParams: PageSizeQueryModel,
    userId: string | null,
  ): Promise<PaginationViewModel<PostViewModel>> {
    const { sortBy, sortDirection, skip, pageSize, blogId } = pageParams;
    const orderBy = transformFirstLetter(sortBy);

    const result = await this.dataSource.query(
      `	SELECT
        p.*,
        b."BlogName",
        -- Количество лайков для каждого поста
        (SELECT COUNT(*)
         FROM public."PostsLikesStatuses" postLikes
         WHERE postLikes."PostId" = p."Id" AND postLikes."LikeStatus" = 'Like') AS "LikesCount",
        -- Количество дизлайков для каждого поста
        (SELECT COUNT(*)
         FROM public."PostsLikesStatuses" postLikes
         WHERE postLikes."PostId" = p."Id" AND postLikes."LikeStatus" = 'Dislike') AS "DislikesCount",
        -- Статус лайка от конкретного пользователя
        (SELECT "LikeStatus"
         FROM public."PostsLikesStatuses"
         WHERE "PostId" = p."Id" AND "UserId" = $4) AS "UserLikeStatus",
        -- Три последних лайка в виде массива объектов
        (SELECT json_agg(json_build_object(
                'addedAt', "CreatedAt",
                'userId', "UserId",
                'login', "UserLogin"
            ))
        FROM (
            SELECT DISTINCT ON ("UserId", "CreatedAt") "CreatedAt", "UserId", "UserLogin"
            FROM public."PostsLikesStatuses"
            WHERE "PostId" = p."Id" AND "LikeStatus" = 'Like'
            ORDER BY "CreatedAt" DESC
            LIMIT 3
        ) AS subquery
        ) AS "NewestLikeCreatedAt"
    FROM
        public."Posts" p
    LEFT JOIN
        public."Blogs" b ON p."BlogId" = b."Id"
    WHERE
        p."BlogId" = $3
    ORDER BY
        "${orderBy}" ${sortDirection}
    LIMIT
        $1 OFFSET $2

        `,
      [pageSize, skip, blogId, userId],
    );

    const count = await this.dataSource.query(
      `
      SELECT count (*)
      FROM public."Posts"
      WHERE "BlogId" = $1
    `,
      [blogId],
    );

    return Paginated.transformPagination<PostViewModel>(
      {
        ...pageParams,
        totalCount: +count[0].count,
      },
      this.getMappedPostItems(result),
    );
  }

  async getPosts(
    pageParams: PageSizeQueryModel,
    userId: string | null,
  ): Promise<PaginationViewModel<PostViewModel>> {
    const { sortBy, sortDirection, skip, pageSize } = pageParams;
    const orderBy = transformFirstLetter(sortBy);

    const result = await this.dataSource.query(
      `	SELECT p.*, 
        b."BlogName", 
        (SELECT COUNT(*)
        FROM public."PostsLikesStatuses" postLikes
        WHERE postLikes."PostId" = p."Id" AND postLikes."LikeStatus" = 'Like') AS "LikesCount",
        (SELECT COUNT(*)
        FROM public."PostsLikesStatuses" postLikes
        WHERE postLikes."PostId" = p."Id" AND postLikes."LikeStatus" = 'Dislike') AS "DislikesCount",
        (SELECT "LikeStatus"
        FROM public."PostsLikesStatuses"
        WHERE "PostId" = p."Id" AND "UserId" = $3) AS "UserLikeStatus",


        (SELECT json_agg(json_build_object(
          'addedAt', "CreatedAt",
          'userId', "UserId",
          'login', "UserLogin"
      ))
  FROM (
      SELECT DISTINCT ON ("UserId", "CreatedAt") "CreatedAt", "UserId", "UserLogin"
      FROM public."PostsLikesStatuses"
      WHERE "PostId" = p."Id" AND "LikeStatus" = 'Like'
      ORDER BY "CreatedAt" DESC
      LIMIT 3
  ) AS subquery
  ) AS "NewestLikeCreatedAt"



        FROM public."Posts" p
        LEFT JOIN public."Blogs" b
        on p."BlogId" = b."Id"
        ORDER BY "${orderBy}" ${sortDirection}
        LIMIT $1 OFFSET $2
      `,
      [pageSize, skip, userId],
    );

    const count = await this.dataSource.query(
      `
      SELECT count (*)
      FROM public."Posts"
    `,
    );

    return Paginated.transformPagination<PostViewModel>(
      {
        ...pageParams,
        totalCount: +count[0].count,
      },
      this.getMappedPostItems(result),
    );
  }
}

// nest -> typeORM  (object relation mapper (JSON convert to object)) -> postgress (СУБД) -> postgressSQL (DB)
