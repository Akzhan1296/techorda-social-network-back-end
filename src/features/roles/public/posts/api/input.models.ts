import { IsIn, MaxLength, MinLength } from "class-validator";
import { Likes, PageSizeDTO, likes } from "../../../../../common/types";

export class CreateCommentInputModel {
  @MinLength(20)
  @MaxLength(300)
  public content: string;
}
export class PostLikeStatus {
  @IsIn(likes)
  likeStatus: Likes;
}

export class CommentsQueryType extends PageSizeDTO {
  sortBy = "createdAt";
  sortDirection = "desc";
}
