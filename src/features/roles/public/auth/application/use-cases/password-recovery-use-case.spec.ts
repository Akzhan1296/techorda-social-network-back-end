import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { PasswordRecoveryUseCase } from "./password-recovery-use-case";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { Registration } from "../../../../../entity/registration-entity";

describe("Password recovery use-case", () => {
  let app: TestingModule;
  let usersRepo: UsersRepo;
  let passwordRecoveryUseCase: PasswordRecoveryUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    usersRepo = app.get<UsersRepo>(UsersRepo);
    passwordRecoveryUseCase = app.get<PasswordRecoveryUseCase>(
      PasswordRecoveryUseCase,
    );

    jest.clearAllMocks();
  });

  it("Should be defined", () => {
    expect(passwordRecoveryUseCase).toBeDefined();
    expect(usersRepo).toBeDefined();
  });
  it("Should not send recovery code, if user not found", async () => {
    jest
      .spyOn(usersRepo, "findUserRegistrationDataByEmail")
      .mockImplementation(async () => null);

    const result = await passwordRecoveryUseCase.execute({
      email: "test@test.com",
    });

    expect(result).toEqual({
      isConfirmDataUpdated: false,
      isUserFound: false,
    });
  });

  it("Should update and send recovery code, if user found", async () => {
    jest
      .spyOn(usersRepo, "findUserRegistrationDataByEmail")
      .mockImplementation(async () => ({}) as unknown as Registration);

    jest
      .spyOn(usersRepo, "saveRegistration")
      .mockImplementation(async () => ({}) as unknown as Registration);

    const result = await passwordRecoveryUseCase.execute({
      email: "test@test.com",
    });

    expect(result).toEqual({
      isConfirmDataUpdated: true,
      isUserFound: true,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
