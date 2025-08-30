import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteDeviceDTO, DeleteDeviceResultDTO } from "../devices.dto";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { DeviceSessionRepo } from "../../../../../infrstructura/deviceSessions/device-sessions.adapter";

export class DeleteCurrentDeviceCommand {
  constructor(public deleteDeviceDTO: DeleteDeviceDTO) {}
}

@CommandHandler(DeleteCurrentDeviceCommand)
export class DeleteCurrentDeviceUseCase
  implements ICommandHandler<DeleteCurrentDeviceCommand>
{
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly deviceSessionRepo: DeviceSessionRepo,
  ) {}

  async execute(
    command: DeleteCurrentDeviceCommand,
  ): Promise<DeleteDeviceResultDTO> {
    const { userId, deviceId } = command.deleteDeviceDTO;

    const result: DeleteDeviceResultDTO = {
      isUserFound: false,
      isDeviceFound: false,
      canDeleteDevice: false,
      isDeviceDeleted: false,
    };

    // check user
    const user = await this.usersRepo.findUserById(userId);
    if (!user) return result;

    result.isUserFound = true;

    // check device in DB
    const deviceData = await this.deviceSessionRepo.getAuthMetaDataByDeviceId({
      deviceId,
    });

    if (!deviceData) return result;
    result.isDeviceFound = true;

    if (user.id !== deviceData.userId) {
      return result;
    }
    result.canDeleteDevice = true;

    try {
      await this.deviceSessionRepo.deleteAuthMetaData(deviceData);
      result.isDeviceDeleted = true;
    } catch (err) {
      throw new Error(err);
    }

    return result;
  }
}
