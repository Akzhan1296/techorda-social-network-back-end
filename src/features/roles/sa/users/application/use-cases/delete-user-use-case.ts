import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteUserResultDTO } from "../users.dto";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";

export class DeleteUserCommand {
  constructor(public userId: string) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(command: DeleteUserCommand): Promise<DeleteUserResultDTO> {
    const result: DeleteUserResultDTO = {
      isUserFound: false,
      isUserDeleted: false,
      isUserHaveRegistrationData: false,
      IsRegistrationDataDeleted: false,
    };

    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) return result;

    result.isUserFound = true;
    const registrationData = await this.usersRepo.findRegistrationDataByUserId(
      user.id,
    );

    // delete registration first user id is refered
    if (registrationData) {
      result.isUserHaveRegistrationData = true;
      try {
        const deleteResult =
          await this.usersRepo.deleteRegistration(registrationData);
        result.IsRegistrationDataDeleted = !!deleteResult.affected;
      } catch (err) {
        throw new Error(`Failed to delete registration data: ${err.message}`);
      }
    }

    // delete user
    try {
      const deleteResult = await this.usersRepo.deleteUser(user.id);
      result.isUserDeleted = !!deleteResult.affected;
    } catch (err) {
      throw new Error(`Failed to delete user: ${err.message}`);
    }

    return result;
  }
}
