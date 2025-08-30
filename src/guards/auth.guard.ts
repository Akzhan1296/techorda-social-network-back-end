import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { settings } from "../settings";
import { UsersRepo } from "../features/infrstructura/users/users.adapter";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }

    const token = request.headers.authorization.split(" ")[1];
    let payload = null;
    let user = null;

    try {
      payload = this.jwtService.verify(token, {
        secret: settings.JWT_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException();
    }
    if (payload && payload.userId && payload.userId.length > 0) {
      user = await this.usersRepo.findUserById(payload.userId);
    }
    if (user) {
      request.body.userId = payload.userId;
      request.body.userLogin = payload.login;

      return true;
    }
    throw new UnauthorizedException();
  }
}
