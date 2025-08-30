import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./posts-entity";
import { User } from "./users-entity";
import { CommentLike } from "./comment-likes-entity";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @Column()
  userLogin: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  @Column()
  postId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => CommentLike, (c) => c.comment, { cascade: true, onDelete: 'CASCADE' })
  commentLikes: CommentLike[];
}
