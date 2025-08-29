import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  RegistrationConfirmationDTO,
  RegistrationConfirmationResultDTO,
} from "../auth.dto";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";

export class RegistrationConfirmationCommand {
  constructor(public confirmCode: RegistrationConfirmationDTO) {}
}
@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(
    command: RegistrationConfirmationCommand,
  ): Promise<RegistrationConfirmationResultDTO> {
    const { code } = command.confirmCode;

    const result: RegistrationConfirmationResultDTO = {
      isUserByConfirmCodeFound: false,
      isEmailAlreadyConfirmed: false,
      isConfirmDateExpired: false,
      isRegistrationConfirmed: false,
    };

    // get user by confirm code
    const registrationDataByConfirmCode =
      await this.usersRepo.findRegistrationDataByConfirmCode(code);

    // check is user found
    if (registrationDataByConfirmCode) {
      result.isUserByConfirmCodeFound = true;
    } else {
      return result;
    }

    // check is confirmed
    if (
      registrationDataByConfirmCode &&
      registrationDataByConfirmCode.isConfirmed
    ) {
      result.isEmailAlreadyConfirmed = true;
      return result;
    }

    // check is isConfirmDateExpired
    if (
      registrationDataByConfirmCode &&
      registrationDataByConfirmCode.emailExpDate < new Date()
    ) {
      result.isConfirmDateExpired = true;
      return result;
    }

    try {
      registrationDataByConfirmCode.isConfirmed = true;
      await this.usersRepo.saveRegistration(registrationDataByConfirmCode);

      result.isRegistrationConfirmed = true;
    } catch (err) {
      throw new Error(err);
    }
    return result;
  }
}
