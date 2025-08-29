import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Likes } from "../../common/types";
import { Comment } from "./comments-entity";
import { Post } from "./posts-entity";
import { User } from "./users-entity";

@Entity()
export class CommentLike {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  likeStatus: Likes;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Comment)
  comment: Comment;

  @Column()
  commentId: string;

  @ManyToOne(() => Post)
  post: Post;

  @Column()
  postId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;
}
