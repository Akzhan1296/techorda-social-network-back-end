import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthSession } from "../../entity/auth-session-entity";
import { DeleteAllDevicesDTO } from "./models/device.models";

@Injectable()
export class DeviceSessionRepo {
  constructor(
    @InjectRepository(AuthSession)
    private deviceSessionRepository: Repository<AuthSession>,
  ) {}

  async getAuthMetaDataByDeviceIdAndUserId(dto: {
    userId: string;
    deviceId: string;
  }) {
    const { userId, deviceId } = dto;

    return this.deviceSessionRepository
      .createQueryBuilder("d")
      .select()
      .where("d.userId = :userId", { userId })
      .andWhere("d.deviceId = :deviceId", { deviceId })
      .getOne();
  }

  async getAuthMetaDataByDeviceNameAndUserId(dto: {
    userId: string;
    deviceName: string;
  }) {
    const { userId, deviceName } = dto;

    return this.deviceSessionRepository
      .createQueryBuilder("d")
      .select()
      .where("d.userId = :userId", { userId })
      .andWhere("d.deviceName = :deviceName", { deviceName })
      .getOne();
  }

  async getAuthMetaDataByDeviceId(dto: { deviceId: string }) {
    return this.deviceSessionRepository.findOneBy({ deviceId: dto.deviceId });
  }

  async saveAuthMetaData(authMetaData: AuthSession) {
    return this.deviceSessionRepository.save(authMetaData);
  }

  async deleteAuthMetaData(authMetaData: AuthSession) {
    return this.deviceSessionRepository.delete(authMetaData);
  }

  async deleteAllAuthMetaDataExceptCurrent(deleteDevices: DeleteAllDevicesDTO) {
    const { deviceId, userId } = deleteDevices;

    return await this.deviceSessionRepository
      .createQueryBuilder()
      .delete()
      .where("userId = :userId", { userId })
      .andWhere("deviceId != :deviceId", { deviceId })
      .execute();
  }
}
