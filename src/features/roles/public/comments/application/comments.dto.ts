import { Likes } from "../../../../../common/types";

export type CreateCommentDTO = {
  userLogin: string;
  userId: string;
  postId: string;
  content: string;
};

export type CreateCommentResult = {
  isPostFound: boolean;
  isCommentCreated: boolean;
  commentId: null | string;
};

export type HandleLikeCommentDTO = {
  commentId: string;
  commentLikeStatus: Likes;
  userId: string;
};

export type HandleCommentLikeResult = {
  isCommentFound: boolean;
  isLikeStatusUpdated: boolean;
  isLikeStatusCreated: boolean;
};

export interface DeleteCommentDTO {
  userId: string;
  commentId: string;
}

export type DeleteCommentResult = {
  isCommentFound: boolean;
  isForbidden: boolean;
  isCommentDeleted: boolean;
};

export interface UpdateCommentDTO extends DeleteCommentDTO {
  content: string;
}

export type UpdateCommentResult = Omit<
  DeleteCommentResult,
  "isCommentDeleted"
> & {
  isCommentUpdated: boolean;
};
