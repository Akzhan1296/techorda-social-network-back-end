import { Test, TestingModule } from "@nestjs/testing";
import { CommandBus } from "@nestjs/cqrs";
import { AppModule } from "../../../../../app.module";
import { UsersController } from "./sa.users.controller";
import { AddUserInputModel } from "./sa.users.models";
import { CreateUserCommand } from "../application/use-cases/create-user-use-case";
import { v4 as uuidv4 } from "uuid";
import { DeleteUserCommand } from "../application/use-cases/delete-user-use-case";
import { BadRequestException } from "@nestjs/common";

const createUserMock: AddUserInputModel = {
  login: "Login",
  password: "password",
  email: "email@email.com",
};

describe("UsersController", () => {
  let usersController: UsersController;
  let commandBus: CommandBus;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    usersController = app.get<UsersController>(UsersController);
    commandBus = app.get<CommandBus>(CommandBus);
  });

  it("Should be defined", () => {
    expect(usersController).toBeDefined();
    expect(commandBus).toBeDefined();
  });

  describe("Adding user flow by SA", () => {
    it("Should add user", async () => {
      const mockResult = {
        id: uuidv4(),
        login: "Login",
        createdAt: new Date(),
        email: "email@email.com",
      };
      // Создание моковой реализации для execute:
      const mockExecute = jest.fn().mockReturnValue(mockResult);

      // Использование jest.spyOn для замены реализации execute на моковую:
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      // act
      const result = await usersController.createUser(createUserMock);

      //results
      expect(result).toBeTruthy();
      expect(result).toEqual(mockResult);
      expect(mockExecute).toHaveBeenCalledWith(
        new CreateUserCommand(createUserMock),
      );
    });
  });

  describe("Delete user flow by SA", () => {
    it("Should delete user", async () => {
      const mockDeleteUserResult = {
        isUserFound: true,
        isUserDeleted: true,
      };
      const mockDeleteUserId = "7d41fc88-7f38-4f5f-97fb-5cac9c05253c";

      // Создание моковой реализации для execute:
      const mockExecute = jest.fn().mockReturnValue(mockDeleteUserResult);

      // Использование jest.spyOn для замены реализации execute на моковую:
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      // act
      const result = await usersController.deleteUser({
        id: mockDeleteUserId,
      });

      //results
      expect(result).toBeTruthy();
      expect(mockExecute).toHaveBeenCalledWith(
        new DeleteUserCommand(mockDeleteUserId),
      );
    });
    it("Should return 404, if user not found", async () => {
      const mockDeleteUserResult = {
        isUserFound: false,
        isUserDeleted: false,
      };
      const mockDeleteUserId = "7d41fc88-7f38-4f5f-97fb-5cac9c05253c";

      // Создание моковой реализации для execute:
      const mockExecute = jest.fn().mockReturnValue(mockDeleteUserResult);

      // Использование jest.spyOn для замены реализации execute на моковую:
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      //result
      await expect(
        usersController.deleteUser({ id: mockDeleteUserId }),
      ).rejects.toEqual(
        new BadRequestException("User by this confirm code not found"),
      );
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
