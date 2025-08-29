import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Blog } from "./blogs-entity";
import { Comment } from "./comments-entity";
import { CommentLike } from "./comment-likes-entity";
import { PostLike } from "./post-likes-entity";

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Blog)
  blog: Blog;

  @Column()
  blogId: string;

  @OneToMany(() => PostLike, (p) => p.post)
  postLikes: PostLike[];

  @OneToMany(() => Comment, (c) => c.post)
  comments: Comment[];

  @OneToMany(() => CommentLike, (c) => c.post)
  commentLikes: CommentLike[];
}
