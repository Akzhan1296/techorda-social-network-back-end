import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { Comment } from "../../entity/comments-entity";
import { CommentLike } from "../../entity/comment-likes-entity";

@Injectable()
export class CommentsRepo {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>
  ) {}

  async findCommentById(commentId: string): Promise<Comment | null> {
    return this.commentsRepository.findOneBy({ id: commentId });
  }

  async findCommentLikeData(dto: { userId: string; commentId: string }) {
    const { userId, commentId } = dto;
    return this.commentLikeRepository.findOne({ where: { userId, commentId } });
  }

  async isAnyCommentLikesData(commentId: string) {
    return this.commentLikeRepository.find({ where: { commentId } });
  }

  async saveCommentLike(commentLike: CommentLike): Promise<CommentLike> {
    return this.commentLikeRepository.save(commentLike);
  }

  async deleteCommentLikeEntities(commentId: string) {
    return this.commentLikeRepository.delete({ commentId });
  }

  async saveComment(comment: Comment): Promise<Comment> {
    return this.commentsRepository.save(comment);
  }

  async deleteComment(comment: Comment): Promise<DeleteResult> {
    return this.commentsRepository.delete(comment);
  }
}
