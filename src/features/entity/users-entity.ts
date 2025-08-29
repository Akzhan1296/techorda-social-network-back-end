import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Registration } from "./registration-entity";
import { AuthSession } from "./auth-session-entity";
import { Comment } from "./comments-entity";
import { CommentLike } from "./comment-likes-entity";
import { PostLike } from "./post-likes-entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  login: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  createdAt: Date;

  @OneToOne(() => Registration, (r) => r.user)
  registration: Registration;

  @OneToMany(() => AuthSession, (auth) => auth.user)
  authSessions: AuthSession[];

  @OneToMany(() => Comment, (c) => c.user)
  comments: Comment[];

  @OneToMany(() => CommentLike, (c) => c.user)
  commentLikes: CommentLike[];

  @OneToMany(() => PostLike, (p) => p.user)
  postLikes: PostLike[];
}
