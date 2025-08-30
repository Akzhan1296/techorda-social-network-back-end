import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { CommandBus } from "@nestjs/cqrs";
import { AppModule } from "../../../../../app.module";
import { AuthRegistrationInputModal } from "./auth.models";
import { RegistrationUserCommand } from "../application/use-cases/registration-user-use-case";
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { RegistrationConfirmationCommand } from "../application/use-cases/registration-confirmation-use-case";
import { EmailResendingCommand } from "../application/use-cases/registration-email-resendings-use-case";
import { LoginCommand } from "../application/use-cases/login-use-case";
import { Request, Response } from "express";
import { useContainer } from "class-validator";
import { HttpExceptionFilter } from "../../../../../exception.filter";

const registrationUserMock: AuthRegistrationInputModal = {
  login: "login",
  password: "password",
  email: "test@test.com",
};

describe("AuthController", () => {
  let authController: AuthController;
  let commandBus: CommandBus;
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(
      new ValidationPipe({
        stopAtFirstError: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errorsForProperty: any[] = [];

          errors.forEach((e) => {
            const constrainKey = Object.keys(e.constraints!);
            constrainKey.forEach((cKey) => {
              errorsForProperty.push({
                field: e.property,
                message: e.constraints![cKey],
              });
            });
          });

          throw new BadRequestException(errorsForProperty);
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    authController = app.get<AuthController>(AuthController);
    commandBus = app.get<CommandBus>(CommandBus);
  });

  it("Should be defined", () => {
    expect(authController).toBeDefined();
    expect(commandBus).toBeDefined();
  });

  describe("Registration user flow", () => {
    it("Should registrate a user", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isLoginAlreadyExist: false,
        isEmailAlreadyExist: false,
        isUserRegistered: true,
      });
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      // act
      const result = await authController.registration(registrationUserMock);

      // results
      expect(result).toBeTruthy();
      expect(mockExecute).toHaveBeenCalledWith(
        new RegistrationUserCommand(registrationUserMock),
      );
    });
    it("Should return 400 error if isLoginAlreadyExist", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isLoginAlreadyExist: true,
        isEmailAlreadyExist: false,
        isUserRegistered: true,
      });
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      await expect(
        authController.registration(registrationUserMock),
      ).rejects.toEqual(new BadRequestException("Login is already exist"));
    });
    it("Should return 400 error if isEmailAlreadyExist", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isLoginAlreadyExist: false,
        isEmailAlreadyExist: true,
        isUserRegistered: true,
      });
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      await expect(
        authController.registration(registrationUserMock),
      ).rejects.toEqual(new BadRequestException("Email is already exist"));
    });
  });

  describe("Registration confirmation flow", () => {
    it("Should confirm email", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserByConfirmCodeFound: true,
        isEmailAlreadyConfirmed: false,
        isConfirmDateExpired: false,
        isRegistrationConfirmed: true,
      });
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      // act
      const result = await authController.registrationConfirmation({
        code: "45dff467-ccdd-49df-9e9d-c6b407538137",
      });

      // results
      expect(result).toBeTruthy();
      expect(mockExecute).toHaveBeenCalledWith(
        new RegistrationConfirmationCommand({
          code: "45dff467-ccdd-49df-9e9d-c6b407538137",
        }),
      );
    });
    it("Should return 400 error if confirmation code is already confirmed", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserByConfirmCodeFound: true,
        isEmailAlreadyConfirmed: true,
        isConfirmDateExpired: false,
        isRegistrationConfirmed: false,
      });

      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      //expect
      await expect(
        authController.registrationConfirmation({
          code: "45dff467-ccdd-49df-9e9d-c6b407538122",
        }),
      ).rejects.toEqual(new BadRequestException("Email is already confirmed"));
    });
    it("Should return 400 error if confirmation date is expired", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserByConfirmCodeFound: true,
        isEmailAlreadyConfirmed: false,
        isConfirmDateExpired: true,
        isRegistrationConfirmed: false,
      });

      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      //expect
      await expect(
        authController.registrationConfirmation({
          code: "45dff467-ccdd-49df-9e9d-c6b407538122",
        }),
      ).rejects.toEqual(new BadRequestException("Date is already expired"));
    });
    it("Should return 404 error if user by confirmationcode is not found", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserByConfirmCodeFound: false,
        isEmailAlreadyConfirmed: false,
        isConfirmDateExpired: false,
        isRegistrationConfirmed: false,
      });

      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      //expect
      await expect(
        authController.registrationConfirmation({
          code: "45dff467-ccdd-49df-9e9d-c6b407538122",
        }),
      ).rejects.toEqual(
        new BadRequestException("User by this confirm code not found"),
      );
    });
  });

  describe("Email code resending", () => {
    it("Should resend confirm code successfully", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserFound: true,
        isEmailResent: true,
        isEmailAlreadyConfirmed: false,
        isConfirmDataUpdated: true,
      });

      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      // act
      const result = await authController.registrationEmailResending({
        email: "test@test.com",
      });

      // results
      expect(result).toBeTruthy();
      expect(mockExecute).toHaveBeenCalledWith(
        new EmailResendingCommand("test@test.com"),
      );
    });
    it("Should return 400 error, if user by email not found", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserFound: false,
        isEmailResent: false,
        isEmailAlreadyConfirmed: false,
        isConfirmDataUpdated: false,
      });

      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);
      await expect(
        authController.registrationEmailResending({ email: "test@test.com" }),
      ).rejects.toEqual(
        new BadRequestException({
          message: "User by this confirm code not found",
          field: "email",
        }),
      );
    });
    it("Should return 400 error, if email is already confirmed", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserFound: true,
        isEmailResent: false,
        isEmailAlreadyConfirmed: true,
        isConfirmDataUpdated: false,
      });

      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);
      await expect(
        authController.registrationEmailResending({ email: "test@test.com" }),
      ).rejects.toEqual(
        new BadRequestException({
          message: "Email is already confirmed",
          field: "email",
        }),
      );
    });
  });

  describe("Login flow", () => {
    it("Should auth successfully ", async () => {
      const loginMock = {
        loginOrEmail: "login",
        password: "password",
        deviceIp: "1",
        deviceName: "device name",
      };

      const mockExecute = jest.fn().mockReturnValue({
        accessToken: "access token",
        refreshToken: "refresh token",
        isCorrectPassword: true,
        isUserAlreadyHasAuthSession: true,
      });
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      const mockRequest = {
        headers: {
          "user-agent": "device name",
        },
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
        status: jest.fn(() => mockResponse),
        send: jest.fn(() => true),
      } as unknown as Response;

      // act
      const result = await authController.login(
        mockRequest,
        mockResponse,
        "1",
        {
          loginOrEmail: "login",
          password: "password",
        },
      );

      // results
      expect(result).toBeTruthy();
      expect(mockExecute).toHaveBeenCalledWith(new LoginCommand(loginMock));
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
