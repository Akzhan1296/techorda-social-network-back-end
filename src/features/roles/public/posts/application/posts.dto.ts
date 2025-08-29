import { Likes } from "../../../../../common/types";

export type HandlePostCommentDTO = {
  postId: string;
  userId: string;
  postLikeStatus: Likes;
  userLogin: string;
};

export type HandlePostLikeResult = {
  isPostFound: boolean;
  isLikeStatusUpdated: boolean;
  isLikeStatusCreated: boolean;
};
