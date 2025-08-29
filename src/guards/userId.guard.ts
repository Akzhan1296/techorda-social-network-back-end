import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { settings } from "../settings";

@Injectable()
export class UserIdGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    request.body.userId = "";
    let payload = null;
    let token = null;

    if (request.headers.authorization) {
      token = request.headers.authorization.split(" ")[1];
    }

    try {
      payload = this.jwtService.verify(token, {
        secret: settings.JWT_SECRET,
      });
    } catch (err) {
      console.warn("could not decode");
    }
    if (payload && payload.userId && payload.userId.length > 0) {
      request.body.userId = payload.userId;
    } else {
      request.body.userId = null;
    }

    return true;
  }
}
