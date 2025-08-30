import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { add } from "date-fns";
import { EmailResendingUseCase } from "./registration-email-resendings-use-case";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { Registration } from "../../../../../entity/registration-entity";
import { v4 as uuidv4 } from "uuid";

const userByEmailMock = {
  createdAt: new Date(),
  emailExpDate: add(new Date(), {
    minutes: 1,
  }),
  isConfirmed: false,
  confirmCode: "a8904469-3781-49a1-a5d7-56007c27ee77",
  registrationId: uuidv4(),
  userId: uuidv4(),
  email: "test@test.com",
} as const;

describe("Registration email resending use-case", () => {
  let app: TestingModule;
  let usersRepo: UsersRepo;
  let emailResendingUseCase: EmailResendingUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    usersRepo = app.get<UsersRepo>(UsersRepo);
    emailResendingUseCase = app.get<EmailResendingUseCase>(
      EmailResendingUseCase,
    );
  });

  it("Should be defined", () => {
    expect(emailResendingUseCase).toBeDefined();
    expect(usersRepo).toBeDefined();
  });
  it("Should resend code", async () => {
    jest
      .spyOn(usersRepo, "findUserRegistrationDataByEmail")
      .mockImplementation(
        async () => userByEmailMock as unknown as Registration,
      );

      jest
      .spyOn(usersRepo, "saveRegistration")
      .mockImplementation(
        async () => userByEmailMock as unknown as Registration,
      );

    const result = await emailResendingUseCase.execute({
      email: "test@test.com",
    });

    expect(result).toEqual({
      isUserFound: true,
      isEmailResent: true,
      isEmailAlreadyConfirmed: false,
      isConfirmDataUpdated: true,
    });
  });
  it("Should return isEmailAlreadyConfirmed: true, if email already confirmed", async () => {
    jest
      .spyOn(usersRepo, "findUserRegistrationDataByEmail")
      .mockImplementation(
        async () =>
          ({
            ...userByEmailMock,
            isConfirmed: true,
          }) as unknown as Registration,
      );

    const result = await emailResendingUseCase.execute({
      email: "test@test.com",
    });

    expect(result).toEqual({
      isUserFound: true,
      isEmailResent: false,
      isEmailAlreadyConfirmed: true,
      isConfirmDataUpdated: false,
    });
  });
  it("Should return isUserFound: false, if user by email not found", async () => {
    jest
      .spyOn(usersRepo, "findUserRegistrationDataByEmail")
      .mockImplementation(async () => null);

    const result = await emailResendingUseCase.execute({
      email: "test@test.com",
    });

    expect(result).toEqual({
      isUserFound: false,
      isEmailResent: false,
      isEmailAlreadyConfirmed: false,
      isConfirmDataUpdated: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
