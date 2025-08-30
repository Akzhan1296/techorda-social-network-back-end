import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthDTO, AutoResultDTO } from "../auth.dto";
import { AuthService } from "../auth.service";
import { v4 as uuidv4 } from "uuid";
import { DeviceSessionRepo } from "../../../../../infrstructura/deviceSessions/device-sessions.adapter";
import { AuthSession } from "../../../../../entity/auth-session-entity";

export class LoginCommand {
  constructor(public authDTO: AuthDTO) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly deviceSessionRepo: DeviceSessionRepo,
  ) {}

  async execute(command: LoginCommand): Promise<AutoResultDTO> {
    const createdAtRefreshToken: Date = new Date();

    let authSessionMetaData: AuthSession | null = null;
    const deviceId = uuidv4();

    const result: AutoResultDTO = {
      accessToken: null,
      refreshToken: null,
      isCorrectPassword: false,
      isUserAlreadyHasAuthSession: false,
    };

    const { deviceName, deviceIp, password, loginOrEmail } = command.authDTO;
    const userData = await this.authService.checkCreds(loginOrEmail, password);

    if (!userData) return result;

    //if user found and correct password
    if (userData) result.isCorrectPassword = true;

    // try to find auth meta data in DB, if we have meta data in DB
    // update createdAt field
    authSessionMetaData =
      await this.deviceSessionRepo.getAuthMetaDataByDeviceNameAndUserId({
        userId: userData.id,
        deviceName,
      });

    // update auth meta data if user already has it
    if (authSessionMetaData) {
      result.isUserAlreadyHasAuthSession = true;

      authSessionMetaData.createdAt = createdAtRefreshToken;

      try {
        await this.deviceSessionRepo.saveAuthMetaData(authSessionMetaData);
      } catch (err) {
        throw new Error(`Some error while updating meta auth data ${err}`);
      }
    }

    // save auth meta data for future refresh token
    if (!authSessionMetaData) {
      const authSession = new AuthSession();

      authSession.email = userData.email;
      authSession.login = userData.login;
      authSession.userId = userData.id;
      authSession.createdAt = createdAtRefreshToken;
      authSession.deviceIp = deviceIp;
      authSession.deviceId = deviceId;
      authSession.deviceName = deviceName;

      try {
        await this.deviceSessionRepo.saveAuthMetaData(authSession);
      } catch (err) {
        throw new Error(`Some error while saving meta auth data ${err}`);
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
      createdAt: createdAtRefreshToken,
      deviceId: authSessionMetaData ? authSessionMetaData.deviceId : deviceId,
      deviceIp,
      deviceName,
    });

    return result;
  }
}
