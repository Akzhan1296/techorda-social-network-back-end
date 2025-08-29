import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

// outdated
export class BlockIpsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async addIpData(dto: {
    ip: string;
    path: string;
    date: number;
  }): Promise<string> {
    const { ip, path, date } = dto;

    const result = await this.dataSource.query(
      `INSERT INTO public."Ips"(
      "Ip", "RequestPath", "DateNumber")
      VALUES ($1, $2, $3)
      RETURNING "Id";`,
      [ip, path, date],
    );
    return result[0].Id;
  }
  async findIp(ip: string, path: string, dateLeft: number, dateRight: number) {
    const result = await this.dataSource.query(
      `  SELECT *
        FROM public."Ips"
        WHERE "Ip" = $1
          AND "RequestPath" = $2
          AND "DateNumber" >= $3
          AND "DateNumber" <= $4;`,
      [ip, path, dateLeft, dateRight],
    );

    return result;
  }
  async dropIps() {
    await this.dataSource.query(`DELETE FROM public."ips"`);
  }
}
