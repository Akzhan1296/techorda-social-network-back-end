import { PageSizeQueryModel, PaginationViewModel } from "./types";

export abstract class Paginated {
  static transformPagination<T>(
    pageParams: PageSizeQueryModel & { totalCount: number },
    items: T[],
  ): PaginationViewModel<T> {
    return {
      totalCount: pageParams.totalCount,
      page: pageParams.pageNumber,
      pageSize: pageParams.pageSize,
      pagesCount: Math.ceil(pageParams.totalCount / pageParams.pageSize),
      items: items,
    };
  }
}
