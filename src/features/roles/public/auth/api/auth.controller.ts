import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Request, Response } from "express";
import { BadRequestException } from "@nestjs/common";

import {
  AuthEmailResendingInputModal,
  AuthLoginInputModal,
  AuthRegistrationConfirmInputModal,
  AuthRegistrationInputModal,
  NewPasswordInputModal,
} from "./auth.models";
import { RegistrationUserCommand } from "../application/use-cases/registration-user-use-case";
import { RegistrationConfirmationCommand } from "../application/use-cases/registration-confirmation-use-case";
import {
  AutoResultDTO,
  NewPasswordResultDTO,
  RecoveryPasswordResultDTO,
  RegistrationConfirmationResultDTO,
  RegistrationEmailResendingResultDTO,
} from "../application/auth.dto";
import { EmailResendingCommand } from "../application/use-cases/registration-email-resendings-use-case";
import { LoginCommand } from "../application/use-cases/login-use-case";
import { RefreshTokenGuard } from "../../../../../guards/refreshToken.guard";
import { UpdateUserRefreshTokenCommand } from "../application/use-cases/refresh-token-use-case";
import { LogOutCommand } from "../application/use-cases/logout-use-case";
import { AuthGuard } from "../../../../../guards/auth.guard";
import { PasswordRecoveryCommand } from "../application/use-cases/password-recovery-use-case";
import { NewPasswordCommand } from "../application/use-cases/new-password-use-case";
// import { BlockIpGuard } from "../../../../../guards/ip.guard";
import { UsersQueryRepo } from "../../../../infrstructura/users/users.query.adapter";
import { UserQueryViewDTO } from "../../../../infrstructura/users/models/users.models";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersQueryRepo: UsersQueryRepo,
  ) {}

  @Post("login")
  // @UseGuards(BlockIpGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() request: Request,
    @Res() response: Response,
    @Ip() deviceIp,
    @Body() inputModel: AuthLoginInputModal,
  ) {
    const result = await this.commandBus.execute<unknown, AutoResultDTO>(
      new LoginCommand({
        loginOrEmail: inputModel.loginOrEmail,
        password: inputModel.password,
        deviceIp,
        deviceName: request.headers["user-agent"],
      }),
    );

    if (!result.isCorrectPassword) {
      throw new UnauthorizedException({ message: "Email or login incorrect" });
    }
    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return response.status(HttpStatus.OK).send({
      accessToken: result.accessToken,
    });
  }

  @Post("refresh-token")
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshtoken(@Req() request: Request, @Res() response: Response) {
    const result = await this.commandBus.execute(
      new UpdateUserRefreshTokenCommand({
        userId: request.body.userId,
        deviceId: request.body.deviceId,
      }),
    );

    response.cookie("refreshToken", `${result.refreshToken}`, {
      httpOnly: true,
      secure: true,
    });
    return response.status(HttpStatus.OK).send({
      accessToken: result.accessToken,
    });
  }

  @Post("logout")
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logOut(@Req() request: Request, @Res() response: Response) {
    await this.commandBus.execute(
      new LogOutCommand({
        deviceId: request.body.deviceId,
        userId: request.body.userId,
      }),
    );
    return response
      .cookie("refreshToken", ``, {
        httpOnly: true,
        secure: true,
      })
      .send();
  }

  @Post("registration")
  // @UseGuards(BlockIpGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Body() inputModel: AuthRegistrationInputModal,
  ): Promise<void> {
    const { login, email, password } = inputModel;

    const { isLoginAlreadyExist, isEmailAlreadyExist, isUserRegistered } =
      await this.commandBus.execute(
        new RegistrationUserCommand({
          login: login,
          email: email,
          password: password,
        }),
      );

    if (isLoginAlreadyExist) {
      throw new BadRequestException({
        message: "Login is already exist",
        field: "login",
      });
    }

    if (isEmailAlreadyExist) {
      throw new BadRequestException({
        message: "Email is already exist",
        field: "email",
      });
    }

    return isUserRegistered;
  }

  @Post("registration-confirmation")
  // @UseGuards(BlockIpGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() inputModel: AuthRegistrationConfirmInputModal,
  ): Promise<boolean> {
    const {
      isUserByConfirmCodeFound,
      isEmailAlreadyConfirmed,
      isConfirmDateExpired,
      isRegistrationConfirmed,
    } = await this.commandBus.execute<
      unknown,
      RegistrationConfirmationResultDTO
    >(new RegistrationConfirmationCommand({ code: inputModel.code }));

    if (isEmailAlreadyConfirmed) {
      throw new BadRequestException({
        message: "Email is already confirmed",
        field: "code",
      });
    }

    if (isConfirmDateExpired) {
      throw new BadRequestException("Date is already expired");
    }

    if (!isUserByConfirmCodeFound) {
      throw new NotFoundException("User by this confirm code not found");
    }
    return isRegistrationConfirmed;
  }

  @Post("registration-email-resending")
  // @UseGuards(BlockIpGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() inputModel: AuthEmailResendingInputModal,
  ): Promise<boolean> {
    const { isUserFound, isEmailResent, isEmailAlreadyConfirmed } =
      await this.commandBus.execute<
        unknown,
        RegistrationEmailResendingResultDTO
      >(new EmailResendingCommand(inputModel.email));

    if (isEmailAlreadyConfirmed) {
      throw new BadRequestException({
        message: "Email is already confirmed",
        field: "email",
      });
    }

    if (!isUserFound) {
      throw new BadRequestException({
        message: "User by this confirm code not found",
        field: "email",
      });
    }

    return isEmailResent;
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async getMe(@Req() request: Request): Promise<UserQueryViewDTO> {
    return await this.usersQueryRepo.findUserById(request.body.userId);
  }

  @Post("password-recovery")
  // @UseGuards(BlockIpGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() inputModel: AuthEmailResendingInputModal,
  ): Promise<void> {
    const { isUserFound } = await this.commandBus.execute<
      unknown,
      RecoveryPasswordResultDTO
    >(new PasswordRecoveryCommand(inputModel.email));

    if (!isUserFound) {
      throw new NotFoundException("User by this  email not found");
    }
  }

  @Post("new-password")
  // @UseGuards(BlockIpGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body() inputModal: NewPasswordInputModal,
  ): Promise<boolean> {
    const {
      isRegistrationDataFound,
      isCorrectRecoveryCode,
      isPasswordUpdated,
    } = await this.commandBus.execute<unknown, NewPasswordResultDTO>(
      new NewPasswordCommand({
        recoveryCode: inputModal.recoveryCode,
        newPassword: inputModal.newPassword,
      }),
    );

    if (!isCorrectRecoveryCode) {
      throw new BadRequestException("Recovery code is incorrect");
    }

    if (!isRegistrationDataFound) {
      throw new NotFoundException("User by recovery code not found");
    }

    return isPasswordUpdated;
  }
}
