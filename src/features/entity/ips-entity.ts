import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ips {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  ip: string;

  @Column()
  requestPath: string;

  @Column("bigint")
  dateNumber: number;
}
