import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { settings } from "../settings";
import { DeviceSessionRepo } from "../features/infrstructura/deviceSessions/device-sessions.adapter";

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly deviceSessionRepo: DeviceSessionRepo,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.cookies) {
      throw new UnauthorizedException();
    }

    const { refreshToken } = request.cookies;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    let payload = null;
    let authMetaData = null;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: settings.JWT_SECRET,
      });
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }
    if (payload) {
      authMetaData =
        await this.deviceSessionRepo.getAuthMetaDataByDeviceIdAndUserId({
          userId: payload.userId,
          deviceId: payload.deviceId,
        });
    }

    if (!authMetaData) {
      throw new UnauthorizedException();
    }

    if (
      authMetaData.createdAt.getTime() !== new Date(payload.createdAt).getTime()
    ) {
      throw new UnauthorizedException();
    }

    request.body.userId = payload.userId; // from jwt payload
    request.body.deviceId = payload.deviceId; // from jwt payload

    return true;
  }
}
