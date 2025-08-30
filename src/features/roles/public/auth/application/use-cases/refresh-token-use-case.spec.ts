import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { UpdateUserRefreshTokenUseCase } from "./refresh-token-use-case";
import { AuthService } from "../auth.service";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { User } from "../../../../../entity/users-entity";
import { DeviceSessionRepo } from "../../../../../infrstructura/deviceSessions/device-sessions.adapter";
import { AuthSession } from "../../../../../entity/auth-session-entity";
import { v4 as uuidv4 } from "uuid";

const getRefreshTokenDTOMock = {
  userId: uuidv4(),
  deviceId: uuidv4()
};

describe("Refresh token use case", () => {
  let app: TestingModule;
  let refreshTokenUseCase: UpdateUserRefreshTokenUseCase;
  let authService: AuthService;
  let usersRepo: UsersRepo;
  let deviceRepo: DeviceSessionRepo;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    refreshTokenUseCase = app.get<UpdateUserRefreshTokenUseCase>(
      UpdateUserRefreshTokenUseCase,
    );
    authService = app.get<AuthService>(AuthService);
    deviceRepo = app.get<DeviceSessionRepo>(DeviceSessionRepo);
    usersRepo = app.get<UsersRepo>(UsersRepo);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(refreshTokenUseCase).toBeDefined();
    expect(authService).toBeDefined();
    expect(deviceRepo).toBeDefined();
    expect(usersRepo).toBeDefined();
  });
  it("Should not return tokens, if userData not found", async () => {
    jest
      .spyOn(usersRepo, "findUserById")
      .mockImplementation(async () => null);

    const result = await refreshTokenUseCase.execute({
      getRefreshTokenDTO: getRefreshTokenDTOMock,
    });

    expect(result).toEqual({
      isUserFound: false,
      isUserAlreadyHasAuthSession: false,
      accessToken: null,
      refreshToken: null,
    });
  });
  it("Should not return tokens, if authMetaData not found", async () => {
    jest.spyOn(usersRepo, "findUserById").mockImplementation(
      async () =>
        ({
          id: "id123",
          login: "login",
          password: "123",
          email: "email",
        }) as User,
    );

    jest
      .spyOn(deviceRepo, "getAuthMetaDataByDeviceIdAndUserId")
      .mockImplementation(async () => null);

    const result = await refreshTokenUseCase.execute({
      getRefreshTokenDTO: getRefreshTokenDTOMock,
    });

    expect(result).toEqual({
      isUserFound: true,
      isUserAlreadyHasAuthSession: false,
      accessToken: null,
      refreshToken: null,
    });
  });
  it("Should update auth meta data, if already have, and return tokens", async () => {
    jest.spyOn(usersRepo, "findUserById").mockImplementation(
      async () =>
        ({
          id: "id123",
          login: "login",
          password: "123",
          email: "email",
        }) as User,
    );

    jest
      .spyOn(deviceRepo, "getAuthMetaDataByDeviceIdAndUserId")
      .mockImplementation(async () => ({}) as AuthSession);

    // mock CT
    jest
      .spyOn(authService, "createAccessToken")
      .mockImplementation(async () => "access token");

    // mock RT
    jest
      .spyOn(authService, "createRefreshToken")
      .mockImplementation(async () => "refresh token");

    jest
      .spyOn(deviceRepo, "saveAuthMetaData")
      .mockImplementation(async () => undefined);
    const result = await refreshTokenUseCase.execute({
      getRefreshTokenDTO: getRefreshTokenDTOMock,
    });

    expect(result).toEqual({
      isUserFound: true,
      isUserAlreadyHasAuthSession: true,
      accessToken: "access token",
      refreshToken: "refresh token",
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});

