import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class AuthBasicGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }

    const decoded = Buffer.from(
      request.headers.authorization.split(" ")[1],
      "base64",
    ).toString();
    const authName = "Basic";

    if (!request.headers.authorization.includes(authName)) {
      throw new UnauthorizedException();
    }
    const name = decoded.split(":")[0];
    const password = decoded.split(":")[1];

    if (name === "admin" && password === "qwerty") {
      return true;
    }

    throw new UnauthorizedException();
  }
}
