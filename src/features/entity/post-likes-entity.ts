import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Likes } from "../../common/types";
import { User } from "./users-entity";
import { Post } from "./posts-entity";

@Entity()
export class PostLike {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  createdAt: Date;

  @Column()
  likeStatus: Likes;

  @Column()
  userLogin: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Post)
  post: Post;

  @Column()
  postId: string;
}
