// create post
export type CreatePostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
export type ResultCreatePostDTO = {
  isBlogFound: boolean;
  isPostCreated: boolean;
  createdPostId: string | null;
};

// delete post
export type DeletePostDTO = Pick<UpdatePostDTO, "postId" | "blogId">;
export type ResultDeletePostDTO = {
  isBlogFound: boolean;
  isPostFound: boolean;
  isPostDeleted: boolean;
};

// update post
export type UpdatePostDTO = CreatePostDTO & {
  postId: string;
};
export type ResultUpdatePostDTO = {
  isBlogFound: boolean;
  isPostFound: boolean;
  isPostUpdated: boolean;
};
