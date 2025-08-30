import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "../../entity/comments-entity";
import { CommentViewModel } from "./models/comments.models";
import { PageSizeQueryModel } from "../../../common/types";
import { Paginated } from "../../../common/paginated";
import { CommentLike } from "../../entity/comment-likes-entity";

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>, 
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>
  ) {}

  async getCommentsByPostId(
    postId: string,
    userId: string | null,
    pageParams: PageSizeQueryModel
  ) {
    const { sortBy, sortDirection, skip, pageSize } = pageParams;

    const result = await this.commentsRepository
      .createQueryBuilder("c")
      .select("c.*")
      .addSelect(subQuery => {
        return subQuery
          .select("cls.likeStatus")
          .from(CommentLike, "cls")
          .where("cls.userId = :userId")
          .andWhere("cls.commentId = c.id")
      }, "userStatus")
      .addSelect(subQuery => {
        return subQuery
          .select("COUNT(*)")
          .from(CommentLike, "cls")
          .where("cls.likeStatus = 'Like'")
          .andWhere("cls.commentId = c.id")
      }, "likesCount")
      .addSelect(subQuery => {
        return subQuery
          .select("COUNT(*)")
          .from(CommentLike, "cls")
          .where("cls.likeStatus = 'Dislike'")
          .andWhere("cls.commentId = c.id")
      }, "dislikesCount")
      .where("c.postId = :postId")
      .setParameter("postId", postId)
      .setParameter("userId", userId)
      .orderBy(
        `c.${sortBy}`,
        `${sortDirection.toUpperCase()}` as "ASC" | "DESC"
      )
      .skip(skip)
      .take(pageSize)
      .getRawMany();

    const count = await this.commentsRepository
      .createQueryBuilder("c")
      .select(["c.*"])
      .where("c.postId = :postId")
      .setParameter("postId", postId)
      .getCount();

    const mappedComments = result.map((comment) => ({
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: +comment.likesCount,
        dislikesCount: +comment.dislikesCount,
        myStatus: comment.userStatus === null ? "None" : comment.userStatus,
      },
    }));

    return Paginated.transformPagination(
      {
        ...pageParams,
        totalCount: count,
      },
      mappedComments
    );
  }

  async getCommentById(
    commentId: string,
    userId: string | null
  ): Promise<CommentViewModel> {

    const comment = await this.commentsRepository
      .createQueryBuilder("c")
      .select("c.*")
      .addSelect(subQuery => {
        return subQuery
          .select("cls.likeStatus")
          .from(CommentLike, "cls")
          .where("cls.userId = :userId")
          .andWhere("cls.commentId = :commentId")
      }, "userStatus")
      .addSelect(subQuery => {
        return subQuery
          .select("COUNT(*)")
          .from(CommentLike, "cls")
          .where("cls.likeStatus = 'Like'")
          .andWhere("cls.commentId = :commentId")
      }, "likesCount")
      .addSelect(subQuery => {
        return subQuery
          .select("COUNT(*)")
          .from(CommentLike, "cls")
          .where("cls.likeStatus = 'Dislike'")
          .andWhere("cls.commentId = :commentId")
      }, "dislikesCount")
      .where("c.id = :commentId")
      .setParameter("commentId", commentId)
      .setParameter("userId", userId)
      .getRawOne();

    if (!comment) {
      return null;
    }

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: +comment.likesCount,
        dislikesCount: +comment.dislikesCount,
        myStatus: comment.userStatus === null ? "None" : comment.userStatus,
      },
    };
  }
}
