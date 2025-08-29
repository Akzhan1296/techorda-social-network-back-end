import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteDeviceDTO } from "../devices.dto";
import { DeviceSessionRepo } from "../../../../../infrstructura/deviceSessions/device-sessions.adapter";

export class DeleteDevicesExceptCurrentCommand {
  constructor(public deleteDeviceDTO: DeleteDeviceDTO) {}
}
@CommandHandler(DeleteDevicesExceptCurrentCommand)
export class DeleteDevicesExceptCurrentUseCase
  implements ICommandHandler<DeleteDevicesExceptCurrentCommand>
{
  constructor(private readonly deviceSessionRepo: DeviceSessionRepo) {}
  async execute(command: DeleteDevicesExceptCurrentCommand): Promise<void> {
    const { deviceId, userId } = command.deleteDeviceDTO;

    await this.deviceSessionRepo.deleteAllAuthMetaDataExceptCurrent({
      deviceId,
      userId,
    });
  }
}
