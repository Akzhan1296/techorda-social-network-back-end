import {
  MinLength,
  MaxLength,
  Matches,
  IsString,
  IsUUID,
} from "class-validator";

export class AuthLoginInputModal {
  @IsString()
  loginOrEmail: string;
  @IsString()
  password: string;
}

export class AuthRegistrationInputModal {
  @MinLength(3)
  @MaxLength(10)
  @Matches(/^[a-zA-Z0-9_-]*$/, { message: "incorrect login" })
  login: string;
  @MinLength(6)
  @MaxLength(20)
  password: string;
  @IsString()
  // eslint-disable-next-line no-useless-escape
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class AuthRegistrationConfirmInputModal {
  @IsUUID(undefined, { each: true })
  code: string;
}
export class AuthEmailResendingInputModal {
  // eslint-disable-next-line no-useless-escape
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class NewPasswordInputModal {
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  newPassword: string;
  @IsUUID(undefined, { each: true })
  recoveryCode: string;
}
