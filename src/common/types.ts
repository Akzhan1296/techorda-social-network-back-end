import { IsNumber, IsUUID } from "class-validator";

export class PageSizeDTO {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @IsNumber()
  pageSize: number = 10;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @IsNumber()
  pageNumber: number = 1;
  sortBy = "";
  sortDirection = "";
  get skip(): number {
    return this.pageSize * (this.pageNumber - 1);
  }
}

export class PageSizeQueryModel {
  pageNumber: number;
  pageSize: number;
  skip: number;
  sortBy: string;
  sortDirection: string;
  searchNameTerm?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  banStatus?: string;
  blogId?: string;
}

export type PaginationViewModel<T> = {
  page: number;
  pagesCount: number;
  pageSize: number;
  totalCount: number;
  items: Array<T>;
};

export class ValidId {
  @IsUUID(undefined, { each: true })
  id: string;
}

export const likes = ["None", "Like", "Dislike"] as const;
export type Likes = (typeof likes)[number];
