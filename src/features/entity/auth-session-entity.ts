import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./users-entity";

@Entity()
export class AuthSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column()
  login: string;

  @Column()
  deviceIp: string;

  @Column("uuid")
  deviceId: string;

  @Column()
  deviceName: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;
}
