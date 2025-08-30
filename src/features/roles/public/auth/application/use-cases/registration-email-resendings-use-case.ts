import { add } from "date-fns";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthService } from "../auth.service";
import { v4 as uuidv4 } from "uuid";
import { RegistrationEmailResendingResultDTO } from "../auth.dto";
import { UsersRepo } from "../../../../../infrstructura/users/users.adapter";

export class EmailResendingCommand {
  constructor(public email: string) {}
}
@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase
  implements ICommandHandler<EmailResendingCommand>
{
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly authService: AuthService,
  ) {}

  async execute(
    command: EmailResendingCommand,
  ): Promise<RegistrationEmailResendingResultDTO> {
    const { email } = command;

    const result: RegistrationEmailResendingResultDTO = {
      isUserFound: false,
      isEmailResent: false,
      isEmailAlreadyConfirmed: false,
      isConfirmDataUpdated: false,
    };

    const registrationData =
      await this.usersRepo.findUserRegistrationDataByEmail(email);
    // check user
    if (registrationData) {
      result.isUserFound = true;
    } else {
      return result;
    }

    // check is confirmed
    if (registrationData && registrationData.isConfirmed) {
      result.isEmailAlreadyConfirmed = true;
      return result;
    }

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
      console.log(err);
      throw new Error(err);
    }

    // send new confirm code is confirm data was updated
    if (result.isConfirmDataUpdated) {
      try {
        await this.authService.sendEmail({
          email: email,
          code: confirmCode,
          letterTitle: "Registration",
          letterText: "Confirm new code",
          codeText: "code",
        });
        result.isEmailResent = true;
      } catch (err) {
        throw new Error(err);
      }
    }
    return result;
  }
}
