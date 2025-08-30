import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GetRefreshTokenDTO, RefreshTokenResultDTO } from "../auth.dto";
import { AuthService } from "../auth.service";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { DeviceSessionRepo } from "../../../../../infrstructura/deviceSessions/device-sessions.adapter";
import { AuthSession } from "../../../../../entity/auth-session-entity";

export class UpdateUserRefreshTokenCommand {
  constructor(public getRefreshTokenDTO: GetRefreshTokenDTO) {}
}

@CommandHandler(UpdateUserRefreshTokenCommand)
export class UpdateUserRefreshTokenUseCase
  implements ICommandHandler<UpdateUserRefreshTokenCommand>
{
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepo: UsersRepo,
    private readonly deviceSessionRepo: DeviceSessionRepo,
  ) {}

  async execute(
    command: UpdateUserRefreshTokenCommand,
  ): Promise<RefreshTokenResultDTO> {
    const { userId, deviceId } = command.getRefreshTokenDTO;
    const createdAtRefreshToken: Date = new Date();

    let authSessionMetaData: AuthSession | null = null;

    const result: RefreshTokenResultDTO = {
      isUserFound: false,
      isUserAlreadyHasAuthSession: false,
      accessToken: null,
      refreshToken: null,
    };

    const userData = await this.usersRepo.findUserById(userId);

    // return result, if user not found
    if (!userData) return result;

    result.isUserFound = true;

    authSessionMetaData =
      await this.deviceSessionRepo.getAuthMetaDataByDeviceIdAndUserId({
        userId,
        deviceId,
      });

    // return result, if no authSessionMetaData
    if (!authSessionMetaData) return result;

    // if found valid meta data, update it
    if (authSessionMetaData) {
      result.isUserAlreadyHasAuthSession = true;
      try {
        authSessionMetaData.createdAt = createdAtRefreshToken;
        await this.deviceSessionRepo.saveAuthMetaData(authSessionMetaData);
      } catch (err) {
        throw new Error(`Some error while updating meta auth data ${err}`);
      }
    }

    // creating AT
    result.accessToken = await this.authService.createAccessToken({
      userId: userData.id,
      login: userData.login,
      email: userData.email,
    });

    // creating RT
    result.refreshToken = await this.authService.createRefreshToken({
      userId: userData.id,
      login: userData.login,
      email: userData.email,
      deviceIp: authSessionMetaData.deviceIp,
      deviceName: authSessionMetaData.deviceName,
      deviceId: authSessionMetaData.deviceId,
      createdAt: createdAtRefreshToken,
    });

    return result;
  }
}
