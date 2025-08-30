import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { LogOutUseCase } from "./logout-use-case";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { DeviceSessionRepo } from "../../../../../infrstructura/deviceSessions/device-sessions.adapter";

describe("Logout use case", () => {
  let app: TestingModule;
  let logOutUseCase: LogOutUseCase;
  let deviceSessionRepo: DeviceSessionRepo;
  let usersRepo: UsersRepo;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    logOutUseCase = app.get<LogOutUseCase>(LogOutUseCase);
    usersRepo = app.get<UsersRepo>(UsersRepo);
    deviceSessionRepo = app.get<DeviceSessionRepo>(DeviceSessionRepo);

  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(logOutUseCase).toBeDefined();
    expect(deviceSessionRepo).toBeDefined();
    expect(usersRepo).toBeDefined();
  });
  it("Should not handle delete, if userData not found", async () => {});

  it("Should not handle delete, if auth meta data not found", async () => {});

  it("Should log out, if auth meta found", async () => {});

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
