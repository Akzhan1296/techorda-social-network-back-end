import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NewPasswordDTO, NewPasswordResultDTO } from "../auth.dto";
import { generateHash } from "../../../../../../utils/passwordHash";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";

export class NewPasswordCommand {
  constructor(public newPasswordDTO: NewPasswordDTO) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(command: NewPasswordCommand): Promise<NewPasswordResultDTO> {
    const result: NewPasswordResultDTO = {
      isRegistrationDataFound: false,
      isCorrectRecoveryCode: false,
      isPasswordUpdated: false,
    };

    const { recoveryCode, newPassword } = command.newPasswordDTO;

    const registrationData =
      await this.usersRepo.findRegistrationDataByConfirmCode(recoveryCode);

    if (!registrationData) return result;

    result.isRegistrationDataFound = true;

    const { confirmCode, emailExpDate, userId } = registrationData;

    if (confirmCode === recoveryCode && emailExpDate > new Date()) {
      const userData = await this.usersRepo.findUserById(userId);
      const passwordHash: string = await generateHash(newPassword);
      userData.password = passwordHash;

      try {
        await this.usersRepo.saveUser(userData);
        result.isPasswordUpdated = true;
        result.isCorrectRecoveryCode = true;
      } catch (err) {
        throw new Error(`something went wrong during change password ${err}`);
      }
    }

    return result;
  }
}
