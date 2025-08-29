import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DevicesViewModel } from "./models/device.models";

// outdated
export class DeviceSessionsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getDevicesByUserId(userId: string): Promise<DevicesViewModel[]> {
    const result = await this.dataSource.query(
      `
      SELECT "Id", "Email", "Login", "DeviceIp", "DeviceId", "DeviceName", "CreatedAt", "UserId"
      FROM public."AuthSessionsMetaData"
      WHERE "UserId" = $1
      `,
      [userId],
    );

    return result.map((r) => ({
      ip: r.DeviceIp,
      title: r.DeviceName,
      lastActiveDate: r.CreatedAt,
      deviceId: r.DeviceId,
    }));
  }
}
