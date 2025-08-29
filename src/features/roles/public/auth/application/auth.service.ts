import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import {
  EmailDataDTO,
  AccessTokenPayloadDTO,
  RefreshTokenPayloadDTO,
} from "./auth.dto";
import { emailAdapter } from "../../../../../utils/emailAdapter";
import { settings } from "../../../../../settings";
import { UsersRepo } from "../../../../infrstructura/users/users.adapter";
import { User } from "../../../../entity/users-entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly jwtService: JwtService,
  ) {}

  async sendEmail(emailDataDTO: EmailDataDTO) {
    const {
      code,
      email,
      letterText,
      letterTitle,
      codeText = "code",
    } = emailDataDTO;
    await emailAdapter.sendEmail(
      email,
      `${letterTitle}`,
      `<a href="http://localhost:5005/?${codeText}=${code}">${letterText}</a>`,
    );
  }
  async checkCreds(
    loginOrEmail: string,
    password: string,
  ): Promise<User | null> {
    let userData: User | null = null;
    let isPasswordExist: boolean = false;
    userData = await this.usersRepo.findUserByEmail(loginOrEmail);
    if (!userData) {
      userData = await this.usersRepo.findUserByLogin(loginOrEmail);
    }

    if (userData) {
      isPasswordExist = await bcrypt.compare(password, userData.password);
    }

    return isPasswordExist ? userData : null;
  }
  async createAccessToken(
    accessTokenPayload: AccessTokenPayloadDTO,
  ): Promise<string> {
    let accessToken = null;
    const { userId, login, email } = accessTokenPayload;

    const payload = {
      userId,
      login,
      email,
    };

    try {
      accessToken = this.jwtService.sign(payload, {
        secret: settings.JWT_SECRET,
        expiresIn: "10 min",
      });
    } catch (err) {
      throw new Error(`Something went wrong with access token ${err}`);
    }

    return accessToken;
  }
  async createRefreshToken(
    refreshTokenPayload: RefreshTokenPayloadDTO,
  ): Promise<string> {
    let refreshsToken = null;
    const { userId, login, email, deviceName, deviceIp, deviceId, createdAt } =
      refreshTokenPayload;

    const payload = {
      userId,
      login,
      email,
      deviceName,
      deviceIp,
      deviceId,
      createdAt,
    };

    try {
      refreshsToken = this.jwtService.sign(payload, {
        secret: settings.JWT_SECRET,
        expiresIn: "20 min",
      });
    } catch (err) {
      throw new Error(`Something went wrong on refresh token${err}`);
    }

    return refreshsToken;
  }
}
