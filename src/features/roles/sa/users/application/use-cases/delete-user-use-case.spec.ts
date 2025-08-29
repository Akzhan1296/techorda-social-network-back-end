import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { DeleteUserUseCase } from "./delete-user-use-case";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { User } from "../../../../../entity/users-entity";
import { Registration } from "../../../../../entity/registration-entity";

describe("Delete user use case", () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let usersRepo: UsersRepo;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    deleteUserUseCase = app.get<DeleteUserUseCase>(DeleteUserUseCase);
    usersRepo = app.get<UsersRepo>(UsersRepo);
  });

  it("Should be defined", () => {
    expect(deleteUserUseCase).toBeDefined();
    expect(usersRepo).toBeDefined();
  });
  it("Should delete user", async () => {
    const mockDeleteUserId = "1b6884e3-43cb-49c6-a796-c34ea6c96ec0";
    const mockUser = { id: mockDeleteUserId };
    const mockRegistrationId = "7d41fc88-7f38-4f5f-97fb-5cac9c05253c";

    // Mock repository methods
    jest
      .spyOn(usersRepo, "findUserById")
      .mockImplementation(async () => mockUser as User);
    jest
      .spyOn(usersRepo, "findRegistrationDataByUserId")
      .mockImplementation(
        async () => ({ id: mockRegistrationId }) as Registration,
      );

    jest
      .spyOn(usersRepo, "deleteRegistration")
      .mockImplementation(async () => ({ affected: 1, raw: "" }));
    jest
      .spyOn(usersRepo, "deleteUser")
      .mockImplementation(async () => ({ affected: 1, raw: "" }));

    await deleteUserUseCase.execute({
      userId: mockDeleteUserId,
    });

    // Verify repository method calls
    expect(usersRepo.findUserById).toHaveBeenCalledWith(mockDeleteUserId);
    expect(usersRepo.findRegistrationDataByUserId).toHaveBeenCalledWith(
      mockUser.id,
    );
    expect(usersRepo.deleteRegistration).toHaveBeenCalledWith({
      id: mockRegistrationId,
    });
    expect(usersRepo.deleteUser).toHaveBeenCalledWith(mockUser.id);
  });
});
