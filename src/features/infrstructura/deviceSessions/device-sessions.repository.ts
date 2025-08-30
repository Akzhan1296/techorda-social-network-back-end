import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import {
  AuthMetaDataEntryDTO,
  AuthMetaDataViewModel,
  DeleteAllDevicesDTO,
} from "./models/device.models";

// outdated
export class DeviceSessionsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAuthMetaDataByDeviceIdAndUserId(dto: {
    userId: string;
    deviceId: string;
  }): Promise<AuthMetaDataViewModel | null> {
    const { userId, deviceId } = dto;

    const result = await this.dataSource.query(
      `
    SELECT "Id", "Email", "Login", "DeviceIp", "DeviceId", "DeviceName", "CreatedAt", "UserId"
	  FROM public."AuthSessionsMetaData"
	  WHERE "UserId" = $1 AND "DeviceId" = $2`,
      [userId, deviceId],
    );

    if (result.length === 0) return null;

    return {
      email: result[0].Email,
      login: result[0].Login,
      deviceIp: result[0].DeviceIp,
      deviceId: result[0].DeviceId,
      deviceName: result[0].DeviceName,
      createdAt: result[0].CreatedAt,
      userId: result[0].UserId,
      id: result[0].Id,
    };
  }

  async getAuthMetaDataByDeviceNameAndUserId(dto: {
    userId: string;
    deviceName: string;
  }): Promise<AuthMetaDataViewModel | null> {
    const { userId, deviceName } = dto;

    const result = await this.dataSource.query(
      `
    SELECT "Id", "Email", "Login", "DeviceIp", "DeviceId", "DeviceName", "CreatedAt", "UserId"
	  FROM public."AuthSessionsMetaData"
	  WHERE "UserId" = $1 AND "DeviceName" like $2`,
      [userId, deviceName],
    );

    if (result.length === 0) return null;

    return {
      email: result[0].Email,
      login: result[0].Login,
      deviceIp: result[0].DeviceIp,
      deviceId: result[0].DeviceId,
      deviceName: result[0].DeviceName,
      createdAt: result[0].CreatedAt,
      userId: result[0].UserId,
      id: result[0].Id,
    };
  }

  async getAuthMetaDataByDeviceId(dto: {
    deviceId: string;
  }): Promise<AuthMetaDataViewModel | null> {
    const { deviceId } = dto;

    const result = await this.dataSource.query(
      `
    SELECT "Id", "Email", "Login", "DeviceIp", "DeviceId", "DeviceName", "CreatedAt", "UserId"
	  FROM public."AuthSessionsMetaData"
	  WHERE "DeviceId" = $1`,
      [deviceId],
    );

    if (result.length === 0) return null;

    return {
      email: result[0].Email,
      login: result[0].Login,
      deviceIp: result[0].DeviceIp,
      deviceId: result[0].DeviceId,
      deviceName: result[0].DeviceName,
      createdAt: result[0].CreatedAt,
      userId: result[0].UserId,
      id: result[0].Id,
    };
  }

  async updateAuthMetaData(dto: {
    authSessionId: string;
    createdAt: Date;
  }): Promise<boolean> {
    const { authSessionId, createdAt } = dto;

    const result = await this.dataSource.query(
      `UPDATE public."AuthSessionsMetaData"
        SET "CreatedAt"= $2
        WHERE "Id" = $1`,
      [authSessionId, createdAt],
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  async createAuthMetaData(authMetaData: AuthMetaDataEntryDTO) {
    const { email, login, deviceId, deviceIp, deviceName, createdAt, userId } =
      authMetaData;

    await this.dataSource.query(
      `INSERT INTO public."AuthSessionsMetaData"(
        "Email", "Login", "DeviceIp", "DeviceId", "DeviceName", "CreatedAt", "UserId")
        VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [email, login, deviceIp, deviceId, deviceName, createdAt, userId],
    );
  }

  async deleteAuthMetaData(deviceId: string) {
    await this.dataSource.query(
      ` 
	      DELETE FROM public."AuthSessionsMetaData"
	      WHERE "DeviceId" = $1
        `,
      [deviceId],
    );

    return;
  }
  async deleteAllAuthMetaDataExceptCurrent(deleteDevices: DeleteAllDevicesDTO) {
    const { deviceId, userId } = deleteDevices;

    await this.dataSource.query(
      ` 
	      DELETE FROM public."AuthSessionsMetaData"
	      WHERE "DeviceId" != $1 AND "UserId" = $2
        `,
      [deviceId, userId],
    );

    return;
  }
}
