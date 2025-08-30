import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserDTO } from "../users.dto";
import { generateHash } from "../../../../../../utils/passwordHash";
import { CreatedUserViewModel } from "../../../../../infrstructura/users/models/users.models";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { User } from "../../../../../entity/users-entity";

export class CreateUserCommand {
  constructor(public createUserDTO: CreateUserDTO) {}
}
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(command: CreateUserCommand): Promise<CreatedUserViewModel> {
    const { login, password, email } = command.createUserDTO;
    const passwordHash: string = await generateHash(password);

    const newUser = new User();
    newUser.login = login;
    newUser.password = passwordHash;
    newUser.email = email;
    newUser.createdAt = new Date();

    try {
      return await this.usersRepo.saveUser(newUser);
    } catch (err) {
      throw new Error();
    }
  }
}
