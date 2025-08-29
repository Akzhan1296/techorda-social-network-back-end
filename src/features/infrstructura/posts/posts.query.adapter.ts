import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "../../entity/posts-entity";
import { PostViewModel } from "./models/posts.models";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";
import { Paginated } from "../../../common/paginated";
import { PostLike } from "../../entity/post-likes-entity";

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>
  ) {}

  private getMappedPostItems(result): PostViewModel[] {
    return result.map((r) => {
      return {
        id: r.id,
        title: r.title,
        shortDescription: r.shortDescription,
        content: r.content,
        blogId: r.blogId,
        blogName: r.b_name,
        createdAt: r.createdAt,
        extendedLikesInfo: {
          likesCount: +r.likesCount,
          dislikesCount: +r.dislikesCount,
          myStatus: r.userLikeStatus ? r.userLikeStatus : "None",
          newestLikes:
            r.newestLikeCreatedAt !== null
              ? r.newestLikeCreatedAt.map((like) => {
                  return {
                    ...like,
                    addedAt: new Date(like.addedAt).toISOString(),
                  };
                })
              : [],
        },
      };
    });
  }

  // one post
  async getPostByPostId(
    postId: string,
    userId: string | null
  ): Promise<PostViewModel | null> {
    let resultView: null | PostViewModel = null;

    const builder = await this.postsRepository
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.blog", "b", `"p"."blogId" = "b"."id"`)
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(*)")
          .from(PostLike, "postLikes")
          .where("postLikes.postId = p.id")
          .andWhere("postLikes.likeStatus = 'Like'");
      }, "likesCount")
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(*)")
          .from(PostLike, "postLikes")
          .where("postLikes.postId = p.id")
          .andWhere("postLikes.likeStatus = 'Dislike'");
      }, "dislikesCount")
      .addSelect((subQuery) => {
        return subQuery
          .select("postLikes.likeStatus")
          .from(PostLike, "postLikes")
          .where("postLikes.postId = p.Id")
          .andWhere("postLikes.userId = :userId");
      }, "userLikeStatus")
      .addSelect(
        `
        (SELECT json_agg(json_build_object(
          'addedAt', "createdAt",
          'userId', "userId",
          'login', "userLogin"
      ))
      FROM (
          SELECT DISTINCT ON ("userId", "createdAt") "createdAt", "userId", "userLogin"
          FROM public."post_like"
          WHERE "postId" = p."id" AND "likeStatus" = 'Like'
          ORDER BY "createdAt" DESC
          LIMIT 3
      ) AS subquery
      )
    `,
        "newestLikeCreatedAt"
      )
      .where("p.Id = :postId")
      .setParameter("postId", postId)
      .setParameter("userId", userId)
      .getRawOne();

    if (builder) {
      const {
        p_title,
        p_createdAt,
        p_shortDescription,
        p_id,
        p_content,
        b_id,
        b_name,
        userLikeStatus,
        newestLikeCreatedAt,
        likesCount,
        dislikesCount,
      } = builder;

      resultView = {
        id: p_id,
        title: p_title,
        shortDescription: p_shortDescription,
        content: p_content,
        blogId: b_id,
        blogName: b_name,
        createdAt: p_createdAt,
        extendedLikesInfo: {
          likesCount: +likesCount,
          dislikesCount: +dislikesCount,
          myStatus: userLikeStatus ? userLikeStatus : "None",
          newestLikes:
            newestLikeCreatedAt !== null
              ? newestLikeCreatedAt.map((like) => ({
                  ...like,
                  addedAt: new Date(like.addedAt).toISOString(),
                }))
              : [],
        },
      };
    }

    return resultView;
  }

  async getPostsByBlogId(
    pageParams: PageSizeQueryModel,
    userId: string | null
  ): Promise<PaginationViewModel<PostViewModel>> {
    const { sortBy, sortDirection, skip, pageSize, blogId } = pageParams;
    const builder = await this.postsRepository
      .createQueryBuilder("p")
      .select(["p.*", "b.name"])
      .leftJoin("p.blog", "b", `"p"."blogId" = "b"."id"`)
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(*)")
          .from(PostLike, "postLikes")
          .where("postLikes.postId = p.id")
          .andWhere("postLikes.likeStatus = 'Like'");
      }, "likesCount")
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(*)")
          .from(PostLike, "postLikes")
          .where("postLikes.postId = p.id")
          .andWhere("postLikes.likeStatus = 'Dislike'");
      }, "dislikesCount")
      .addSelect((subQuery) => {
        return subQuery
          .select("postLikes.likeStatus")
          .from(PostLike, "postLikes")
          .where("postLikes.postId = p.Id")
          .andWhere("postLikes.userId = :userId");
      }, "userLikeStatus")
      .addSelect(
        `
        (SELECT json_agg(json_build_object(
          'addedAt', "createdAt",
          'userId', "userId",
          'login', "userLogin"
      ))
      FROM (
          SELECT DISTINCT ON ("userId", "createdAt") "createdAt", "userId", "userLogin"
          FROM public."post_like"
          WHERE "postId" = p."id" AND "likeStatus" = 'Like'
          ORDER BY "createdAt" DESC
          LIMIT 3
      ) AS subquery
      )
    `,
        "newestLikeCreatedAt"
      )
      .where({ blogId })
      .orderBy(
        `p.${sortBy}`,
        `${sortDirection.toUpperCase()}` as "ASC" | "DESC"
      )
      .offset(skip)
      .limit(pageSize)
      .setParameter("userId", userId)
      .getRawMany();

    const count = await this.postsRepository
      .createQueryBuilder()
      .select()
      .where({ blogId })
      .getCount();

    return Paginated.transformPagination<PostViewModel>(
      {
        ...pageParams,
        totalCount: +count,
      },
      this.getMappedPostItems(builder)
    );
  }

  async getPosts(
    pageParams: PageSizeQueryModel,
    userId: string | null
  ): Promise<PaginationViewModel<PostViewModel>> {
    const { sortBy, sortDirection, skip, pageSize } = pageParams;

    const fieldEntityMapping = {
      id: "p",
      title: "p",
      shortDescription: "p",
      content: "p",
      createdAt: "p",
      blogId: "p",
      blogName: "b",
      websiteUrl: "b",
      description: "b",
      isMembership: "b",
    };

    const sortByField = sortBy === "blogName" ? "name" : sortBy;

    const builder = await this.postsRepository
      .createQueryBuilder("p")
      .select(["p.*", "b.name"])
      .leftJoin("p.blog", "b", `"p"."blogId" = "b"."id"`)
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(*)")
          .from(PostLike, "postLikes")
          .where("postLikes.postId = p.id")
          .andWhere("postLikes.likeStatus = 'Like'");
      }, "likesCount")
      .addSelect((subQuery) => {
        return subQuery
          .select("COUNT(*)")
          .from(PostLike, "postLikes")
          .where("postLikes.postId = p.id")
          .andWhere("postLikes.likeStatus = 'Dislike'");
      }, "dislikesCount")
      .addSelect((subQuery) => {
        return subQuery
          .select("postLikes.likeStatus")
          .from(PostLike, "postLikes")
          .where("postLikes.postId = p.Id")
          .andWhere("postLikes.userId = :userId");
      }, "userLikeStatus")
      .addSelect(
        `
        (SELECT json_agg(json_build_object(
          'addedAt', "createdAt",
          'userId', "userId",
          'login', "userLogin"
      ))
      FROM (
          SELECT DISTINCT ON ("userId", "createdAt") "createdAt", "userId", "userLogin"
          FROM public."post_like"
          WHERE "postId" = p."id" AND "likeStatus" = 'Like'
          ORDER BY "createdAt" DESC
          LIMIT 3
      ) AS subquery
      )
    `,
        "newestLikeCreatedAt"
      )
      .orderBy(
        `${fieldEntityMapping[sortBy]}.${sortByField}`,
        `${sortDirection.toUpperCase()}` as "ASC" | "DESC"
      )
      .offset(skip)
      .limit(pageSize)
      .setParameter("userId", userId)
      .getRawMany();

    const count = await this.postsRepository.createQueryBuilder("p").getCount();

    return Paginated.transformPagination<PostViewModel>(
      {
        ...pageParams,
        totalCount: +count,
      },
      this.getMappedPostItems(builder)
    );
  }
}
