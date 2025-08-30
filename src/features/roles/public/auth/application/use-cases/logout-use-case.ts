import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LogOutDTO, LogOutResultDTO } from "../auth.dto";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { DeviceSessionRepo } from "../../../../../infrstructura/deviceSessions/device-sessions.adapter";

export class LogOutCommand {
  constructor(public logOutDTO: LogOutDTO) {}
}

@CommandHandler(LogOutCommand)
export class LogOutUseCase implements ICommandHandler<LogOutCommand> {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly deviceSessionRepo: DeviceSessionRepo,
  ) {}

  async execute(command: LogOutCommand): Promise<LogOutResultDTO> {
    const { userId, deviceId } = command.logOutDTO;

    const result: LogOutResultDTO = {
      isDeleted: false,
      isForbidden: false,
    };

    // try to find user in DB
    const user = await this.usersRepo.findUserById(userId);
    if (!user) return result;

    // try to find auth meta data in DB
    const device =
      await this.deviceSessionRepo.getAuthMetaDataByDeviceIdAndUserId({
        deviceId,
        userId,
      });

    if (!device) return result;

    // if user and auth meta data were found, delete auth meta data
    try {
      await this.deviceSessionRepo.deleteAuthMetaData(device);

      const authMetaData =
        await this.deviceSessionRepo.getAuthMetaDataByDeviceIdAndUserId({
          deviceId,
          userId,
        });

      result.isDeleted = !authMetaData;
    } catch (err) {
      throw new Error(`Failed to delete auth meta data: ${err.message}`);
    }

    return result;
  }
}
