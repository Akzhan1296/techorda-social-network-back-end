import { add } from "date-fns";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthService } from "../auth.service";
import { v4 as uuidv4 } from "uuid";
import { RecoveryPasswordResultDTO } from "../auth.dto";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}
@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly authService: AuthService,
  ) {}

  async execute(
    command: PasswordRecoveryCommand,
  ): Promise<RecoveryPasswordResultDTO> {
    const result: RecoveryPasswordResultDTO = {
      isUserFound: false,
      isConfirmDataUpdated: false,
    };

    const registrationData =
      await this.usersRepo.findUserRegistrationDataByEmail(command.email);

    if (!registrationData) {
      return result;
    }

    result.isUserFound = true;
    const confirmCode = uuidv4();

    // update confirm data
    try {
      registrationData.confirmCode = confirmCode;
      registrationData.emailExpDate = add(new Date(), {
        minutes: 100,
      });
      await this.usersRepo.saveRegistration(registrationData);

      result.isConfirmDataUpdated = true;
    } catch (err) {
      throw new Error(err);
    }

    // send email
    try {
      await this.authService.sendEmail({
        email: command.email,
        code: confirmCode,
        letterTitle: "Password recovery",
        letterText: "Recovery Code",
      });
    } catch (err) {
      throw new Error(err);
    }

    return result;
  }
}
