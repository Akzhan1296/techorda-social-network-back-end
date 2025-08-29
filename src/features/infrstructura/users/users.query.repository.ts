import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreatedUserViewModel, UserQueryViewDTO } from "./models/users.models";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";
import { Paginated } from "../../../common/paginated";
import { transformFirstLetter } from "../../../utils/upperFirstLetter";

// outdated
export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  // user table
  async getUsers(
    pageParams: PageSizeQueryModel,
  ): Promise<PaginationViewModel<CreatedUserViewModel>> {
    const {
      sortBy,
      sortDirection,
      skip,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
    } = pageParams;

    const orderBy = transformFirstLetter(sortBy);

    const result = await this.dataSource.query(
      `
        SELECT "Id", "Login", "CreatedAt", "Email"
        FROM public."Users"
        WHERE "Login"  ILIKE $1 OR "Email" ILIKE $2
        ORDER BY "${orderBy}" ${sortDirection}
        LIMIT $3 OFFSET $4
      `,
      [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`, pageSize, skip],
    );

    const count = await this.dataSource.query(
      `
      SELECT count (*)
      FROM public."Users"
      WHERE "Login" ILIKE $1 OR "Email" ILIKE $2
    `,
      [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`],
    );

    const mappedResult = result.map((r) => ({
      id: r.Id,
      login: r.Login,
      email: r.Email,
      createdAt: r.CreatedAt,
    }));

    return Paginated.transformPagination<CreatedUserViewModel>(
      {
        ...pageParams,
        totalCount: +count[0].count,
      },
      mappedResult,
    );
  }

  // user table
  async findUserById(id: string): Promise<UserQueryViewDTO | null> {
    // Users table
    const result = await this.dataSource.query(
      `
      SELECT "Id", "Login", "Password", "Email"
      FROM public."Users"
      WHERE "Id" = $1`,
      [id],
    );

    if (result.length === 0) return null;
    return {
      login: result[0].Login,
      userId: result[0].Id,
      email: result[0].Email,
    };
  }
}
