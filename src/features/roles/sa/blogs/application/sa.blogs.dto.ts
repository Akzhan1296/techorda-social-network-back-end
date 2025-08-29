export interface CreateBlogDTO {
  name: string;
  description: string;
  websiteUrl: string;
}

export interface ResultCreateBlogDTO {
  createdBlogId: string | null;
  isBlogCreated: boolean;
}

export interface UpdateBlogDTO extends CreateBlogDTO {
  blogId: string;
}
export interface UpdateBlogResultDTO {
  isBlogFound: boolean;
  isBlogUpdated: boolean;
}

export interface DeleteBlogResultDTO {
  isBlogFound: boolean;
  isBlogDeleted: boolean;
}
