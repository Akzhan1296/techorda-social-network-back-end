import {
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
  IsOptional,
  IsEnum,
} from "class-validator";
import { PageSizeDTO } from "../../../../../common/types";

export class AddUserInputModel {
  @MinLength(3)
  @MaxLength(10)
  @Matches("^[a-zA-Z0-9_-]*$")
  login: string;
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]*$/, { message: "not valid password" })
  password: string;
  // eslint-disable-next-line no-useless-escape
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export enum BanStatuses {
  ALL = "all",
  BANNED = "banned",
  NOT_BANNED = "notBanned",
}

export class UsersQueryType extends PageSizeDTO {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  searchLoginTerm = "";
  searchEmailTerm = "";
  sortBy = "createdAt";
  sortDirection = "desc";
  @IsOptional()
  @IsEnum(BanStatuses)
  banStatus: string;
}

export class BanUserInputModal {
  @IsBoolean()
  isBanned: boolean;
  @MinLength(20)
  banReason: string;
}
