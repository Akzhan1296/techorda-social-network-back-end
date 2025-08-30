import {
  MinLength,
  MaxLength,
  Matches,
  IsString,
} from "class-validator";

export class CreateUserBlogInputModel {
  @IsString()
  @MinLength(1)
  @MaxLength(15)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]*)*\/?$/)
  websiteUrl: string;
}
