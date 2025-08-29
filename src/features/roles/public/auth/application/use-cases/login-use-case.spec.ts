import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { AuthService } from "../auth.service";

import { LoginUseCase } from "./login-use-case";
import bcrypt from "bcrypt";
import { DeviceSessionRepo } from "../../../../../infrstructura/deviceSessions/device-sessions.adapter";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { AuthSession } from "../../../../../entity/auth-session-entity";
import { User } from "../../../../../entity/users-entity";

const authMock = {
  loginOrEmail: "login",
  password: "123",
  deviceName: "deviceName",
  deviceIp: "1",
};

describe("Login use case", () => {
  let app: TestingModule;
  let loginUseCase: LoginUseCase;
  let authService: AuthService;
  let deviceSessionRepository: DeviceSessionRepo;
  let usersRepo: UsersRepo;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    loginUseCase = app.get<LoginUseCase>(LoginUseCase);
    authService = app.get<AuthService>(AuthService);
    usersRepo = app.get<UsersRepo>(UsersRepo);
    deviceSessionRepository = app.get<DeviceSessionRepo>(DeviceSessionRepo);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(loginUseCase).toBeDefined();
    expect(authService).toBeDefined();
    expect(deviceSessionRepository).toBeDefined();
    expect(usersRepo).toBeDefined();
  });
  it("Should not return tokens, if userData not found", async () => {
    jest.spyOn(authService, "checkCreds").mockImplementation(async () => null);

    const result = await loginUseCase.execute({
      authDTO: authMock,
    });

    expect(result).toEqual({
      accessToken: null,
      refreshToken: null,
      isCorrectPassword: false,
      isUserAlreadyHasAuthSession: false,
    });
  });
  it("Should update auth meta data, if already have, and return tokens", async () => {
    //mock usersRepository
    jest.spyOn(usersRepo, "findUserByEmail").mockImplementation(
      async () =>
        ({
          id: "id123",
          login: "login",
          password: "123",
          email: "email",
        }) as User,
    );

    // mock authSessionMetaData
    jest
      .spyOn(deviceSessionRepository, "getAuthMetaDataByDeviceNameAndUserId")
      .mockImplementation(async () => ({}) as AuthSession);

    // mock CT
    jest
      .spyOn(authService, "createAccessToken")
      .mockImplementation(async () => "access token");

    // mock RT
    jest
      .spyOn(authService, "createRefreshToken")
      .mockImplementation(async () => "refresh token");

    // mock bcrypt
    jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);

    jest
      .spyOn(deviceSessionRepository, "saveAuthMetaData")
      .mockImplementation(async () => undefined);

    const result = await loginUseCase.execute({
      authDTO: authMock,
    });

    expect(result).toEqual({
      accessToken: "access token",
      refreshToken: "refresh token",
      isCorrectPassword: true,
      isUserAlreadyHasAuthSession: true,
    });
  });
  it("Should create meta data, if no, and return tokens", async () => {
    //mock usersRepository
    jest.spyOn(usersRepo, "findUserByEmail").mockImplementation(
      async () =>
        ({
          id: "id123",
          login: "login",
          password: "123",
          email: "email",
        }) as User,
    );

    // mock bcrypt
    jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);

    // mock authSessionMetaData
    jest
      .spyOn(deviceSessionRepository, "getAuthMetaDataByDeviceNameAndUserId")
      .mockImplementation(async () => null);
    jest
      .spyOn(deviceSessionRepository, "saveAuthMetaData")
      .mockImplementation(async () => undefined);

    // mock CT
    jest
      .spyOn(authService, "createAccessToken")
      .mockImplementation(async () => "access token");

    // mock RT
    jest
      .spyOn(authService, "createRefreshToken")
      .mockImplementation(async () => "refresh token");

    const result = await loginUseCase.execute({
      authDTO: authMock,
    });

    expect(result).toEqual({
      accessToken: "access token",
      refreshToken: "refresh token",
      isCorrectPassword: true,
      isUserAlreadyHasAuthSession: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
