import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./posts-entity";

@Entity()
export class Blog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  websiteUrl: string;

  @Column()
  description: string;

  @Column({ default: false })
  isMembership: boolean;

  @Column()
  createdAt: Date;

  @OneToMany(() => Post, (p) => p.blog)
  posts: Post[];
}
