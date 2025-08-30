import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./users-entity";

@Entity()
export class Registration {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  confirmCode: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column()
  emailExpDate: Date;

  @Column()
  createdAt: Date;

  @OneToOne(() => User, (u) => u.registration)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;
}
