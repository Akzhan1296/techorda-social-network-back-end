import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthSession } from "../../entity/auth-session-entity";
import { DevicesViewModel } from "./models/device.models";

@Injectable()
export class DeviceSessionQueryRepo {
  constructor(
    @InjectRepository(AuthSession)
    private deviceSessionRepository: Repository<AuthSession>,
  ) {}

  async getDevicesByUserId(userId: string): Promise<DevicesViewModel[]> {
    const users = await this.deviceSessionRepository
      .createQueryBuilder("u")
      .select()
      .where("u.userId = :userId", { userId })
      .getMany();

    return users.map((u) => ({
      ip: u.deviceIp,
      title: u.deviceName,
      lastActiveDate: u.createdAt.toISOString(),
      deviceId: u.deviceId,
    }));
  }
}
