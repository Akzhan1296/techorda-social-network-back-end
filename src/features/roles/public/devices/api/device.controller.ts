import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Request } from "express";
import { RefreshTokenGuard } from "../../../../../guards/refreshToken.guard";
import { DevicesViewModel } from "../../../../infrstructura/deviceSessions/models/device.models";
import { DeleteCurrentDeviceCommand } from "../application/use-cases/delete-current-device-use-case";
import { DeleteDeviceResultDTO } from "../application/devices.dto";
import { DeleteDevicesExceptCurrentCommand } from "../application/use-cases/delete-all-devices-use-case";
import { ValidId } from "../../../../../common/types";
import { DeviceSessionQueryRepo } from "../../../../infrstructura/deviceSessions/device-sessions.query.adapter";

@Controller("security/devices")
export class DevicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly deviceSessionsQueryRepo: DeviceSessionQueryRepo,
  ) {}

  @Get("")
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async getDevices(@Req() request: Request): Promise<DevicesViewModel[]> {
    return this.deviceSessionsQueryRepo.getDevicesByUserId(request.body.userId);
  }

  @Delete("")
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllDevices(@Req() request: Request): Promise<boolean> {
    return this.commandBus.execute(
      new DeleteDevicesExceptCurrentCommand({
        deviceId: request.body.deviceId,
        userId: request.body.userId,
      }),
    );
  }

  // deviceId
  @Delete(":id")
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSelectedDevice(
    @Req() request: Request,
    @Param() params: ValidId,
  ): Promise<boolean> {
    const { isDeviceFound, canDeleteDevice, isDeviceDeleted } =
      await this.commandBus.execute<unknown, DeleteDeviceResultDTO>(
        new DeleteCurrentDeviceCommand({
          deviceId: params.id,
          userId: request.body.userId,
        }),
      );

    if (!isDeviceFound) throw new NotFoundException();
    if (!canDeleteDevice) throw new ForbiddenException();

    return isDeviceDeleted;
  }
}
