import { v4 as uuidv4 } from "uuid";
import { add } from "date-fns";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { AuthService } from "../auth.service";
import { RegistrationUserResultDTO, RegistrationUserDTO } from "../auth.dto";

//use-case
import { CreateUserCommand } from "../../../../sa/users/application/use-cases/create-user-use-case";

//repo
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";
import { Registration } from "../../../../../entity/registration-entity";

export class RegistrationUserCommand {
  constructor(public registrationUser: RegistrationUserDTO) {}
}
@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
    private readonly usersRepo: UsersRepo,
  ) {}

  async execute(
    command: RegistrationUserCommand,
  ): Promise<RegistrationUserResultDTO> {
    let userId = null;
    let confirmCode = null;

    const result: RegistrationUserResultDTO = {
      isLoginAlreadyExist: false,
      isEmailAlreadyExist: false,
      isUserRegistered: false,
      isUserCreated: false,
    };
    const { email, login, password } = command.registrationUser;

    // check login
    const isLoginAlreadyExist = await this.usersRepo.findUserByLogin(login);

    if (isLoginAlreadyExist) {
      result.isLoginAlreadyExist = true;
      return result;
    }

    // check email
    const isEmailAlreadyExist = await this.usersRepo.findUserByEmail(email);

    if (isEmailAlreadyExist) {
      result.isEmailAlreadyExist = true;
      return result;
    }

    try {
      const createdUser = await this.commandBus.execute(
        new CreateUserCommand({
          email,
          login,
          password,
        }),
      );
      result.isUserCreated = !!createdUser;
      userId = createdUser.id;
    } catch (err) {
      throw new Error(err);
    }

    if (result.isUserCreated) {
      confirmCode = uuidv4();
      try {
        const registrationData = new Registration();
        registrationData.userId = userId;
        registrationData.confirmCode = confirmCode;
        registrationData.isConfirmed = false;
        registrationData.emailExpDate = add(new Date(), {
          minutes: 100,
        });
        registrationData.createdAt = new Date();

        await this.usersRepo.saveRegistration(registrationData);

        result.isUserRegistered = true;
      } catch (err) {
        this.usersRepo.deleteUser(userId);
        throw new Error(err);
      }
    }

    // send letter to confirm if user created successfully and registrated
    if (result.isUserCreated && result.isUserRegistered) {
      try {
        await this.authService.sendEmail({
          email: email,
          code: confirmCode,
          letterTitle: "Registration",
          letterText: "Confirm code",
          codeText: "code",
        });
      } catch (err) {
        throw new Error(err);
      }
    }
    return result;
  }
}
