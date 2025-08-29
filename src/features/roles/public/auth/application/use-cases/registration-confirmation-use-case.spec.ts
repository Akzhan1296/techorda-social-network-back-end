import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { RegistrationConfirmationUseCase } from "./registration-confirmation-use-case";
import { add } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { Registration } from "../../../../../entity/registration-entity";

const userByConfirmCodeMock = {
  createdAt: new Date(),
  emailExpDate: add(new Date(), {
    minutes: 1,
  }),
  isConfirmed: false,
  confirmCode: "a8904469-3781-49a1-a5d7-56007c27ee77",
  registrationId: uuidv4(),
  userId: uuidv4(),
} as const;

describe("Registration confirmation use-case", () => {
  let app: TestingModule;
  let usersRepo: UsersRepo;
  let registrationConfirmationUserUseCase: RegistrationConfirmationUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    usersRepo = app.get<UsersRepo>(UsersRepo);
    registrationConfirmationUserUseCase =
      app.get<RegistrationConfirmationUseCase>(RegistrationConfirmationUseCase);
  });

  it("Should be defined", () => {
    expect(registrationConfirmationUserUseCase).toBeDefined();
    expect(usersRepo).toBeDefined();
  });
  it("Should confirm registration", async () => {
    jest
      .spyOn(usersRepo, "findRegistrationDataByConfirmCode")
      .mockImplementation(
        async () => userByConfirmCodeMock as unknown as Registration,
      );

    jest
      .spyOn(usersRepo, "saveRegistration")
      .mockImplementation(async () => null as unknown as Registration);

    const result = await registrationConfirmationUserUseCase.execute({
      confirmCode: { code: "a8904469-3781-49a1-a5d7-56007c27ee77" },
    });

    expect(result).toEqual({
      isUserByConfirmCodeFound: true,
      isEmailAlreadyConfirmed: false,
      isConfirmDateExpired: false,
      isRegistrationConfirmed: true,
    });
  });

  it("Should return isEmailAlreadyConfirmed: true, if email already confirmed", async () => {
    jest
      .spyOn(usersRepo, "findRegistrationDataByConfirmCode")
      .mockImplementation(
        async () =>
          ({
            ...userByConfirmCodeMock,
            isConfirmed: true,
          }) as unknown as Registration,
      );

    const result = await registrationConfirmationUserUseCase.execute({
      confirmCode: { code: "a8904469-3781-49a1-a5d7-56007c27ee77" },
    });

    expect(result).toEqual({
      isUserByConfirmCodeFound: true,
      isEmailAlreadyConfirmed: true,
      isConfirmDateExpired: false,
      isRegistrationConfirmed: false,
    });
  });

  it("Should return isConfirmDateExpired: true, if exp date is already expired", async () => {
    jest
      .spyOn(usersRepo, "findRegistrationDataByConfirmCode")
      .mockImplementation(
        async () =>
          ({
            ...userByConfirmCodeMock,
            isConfirmed: false,
            emailExpDate: add(new Date(), {
              minutes: -10,
            }),
          }) as unknown as Registration,
      );

    const result = await registrationConfirmationUserUseCase.execute({
      confirmCode: { code: "a8904469-3781-49a1-a5d7-56007c27ee77" },
    });

    expect(result).toEqual({
      isUserByConfirmCodeFound: true,
      isEmailAlreadyConfirmed: false,
      isConfirmDateExpired: true,
      isRegistrationConfirmed: false,
    });
  });

  it("Should return isUserByConfirmCodeFound: false, if user by confirm code not found", async () => {
    jest
      .spyOn(usersRepo, "findRegistrationDataByConfirmCode")
      .mockImplementation(async () => null);

    const result = await registrationConfirmationUserUseCase.execute({
      confirmCode: { code: "a8904469-3781-49a1-a5d7-56007c27ee77" },
    });

    expect(result).toEqual({
      isUserByConfirmCodeFound: false,
      isEmailAlreadyConfirmed: false,
      isConfirmDateExpired: false,
      isRegistrationConfirmed: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
