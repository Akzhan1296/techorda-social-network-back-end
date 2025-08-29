export type CreateCommentType = {
  postId: string;
  content: string;
  createdAt: Date;
  userId: string;
  userLogin: string;
};

export type CommentDataView = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  postId: string;
};

export type GetCommentLikeDataDTO = {
  commentId: string;
  userId: string;
};

export type SetCommentLikeEntityDto = {
  commentId: string;
  userId: string;
  likeStatus: string;
  postId: string;
  createdAt: Date;
};

export type UpdateCommentLikeEntityDto = {
  likeEntityId: string;
  likeStatus: string;
};

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus?: string;
  };
  postId?: string;
};

export type UpdateCommentType = {
  commentId: string;
  content: string;
};
