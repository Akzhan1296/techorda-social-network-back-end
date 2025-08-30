import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { CreateUserUseCase } from "./create-user-use-case";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { User } from "../../../../../entity/users-entity";

describe("Create user use case", () => {
  let createUserUseCase: CreateUserUseCase;
  let usersRepo: UsersRepo;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    createUserUseCase = app.get<CreateUserUseCase>(CreateUserUseCase);
    usersRepo = app.get<UsersRepo>(UsersRepo);
  });

  it("Should be defined", () => {
    expect(createUserUseCase).toBeDefined();
    expect(usersRepo).toBeDefined();
  });
  it("Should create user", async () => {
    const createUserDTO = {
      login: "123",
      password: "123",
      email: "132",
    };

    const createdUserMock = {
      login: "123",
      id: "88ab75aa-523e-4eb8-a288-c8f7c2329813",
      email: "132",
      createdAt: new Date(),
    };

    jest
      .spyOn(usersRepo, "saveUser")
      .mockImplementation(async () => createdUserMock as User);

    const result = await createUserUseCase.execute({ createUserDTO });
    expect(result).toEqual(createdUserMock);
  });
});
