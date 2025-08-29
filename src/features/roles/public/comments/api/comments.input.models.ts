import { IsIn, MaxLength, MinLength } from "class-validator";
import { Likes, likes } from "../../../../../common/types";
export class CommentLikeStatus {
  @IsIn(likes)
  likeStatus: Likes;
}

export class CommentInputModelType {
  @MaxLength(100)
  @MinLength(20)
  content: string;
}
