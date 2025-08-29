export type CreateBlogDTO = {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
};

export type BlogViewModel = {
  name: string;
  id: string;
  websiteUrl: string;
  createdAt: Date;
  description: string;
  isMembership: boolean;
  isBanned?: boolean;
};

export type UpdateBlogDTO = Pick<
  CreateBlogDTO,
  "description" | "name" | "websiteUrl"
> & {
  blogId: string;
};
