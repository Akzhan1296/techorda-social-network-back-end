import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../entity/users-entity";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";
import { CreatedUserViewModel } from "./models/users.models";
import { Paginated } from "../../../common/paginated";

export class UsersQueryRepo {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  private getUserViewModel(user: User) {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async findUserById(id: string) {
    const builder = await this.usersRepository
      .createQueryBuilder()
      .where({ id })
      .getOne();

    if (builder) {
      const { login, id, email } = builder;
      return {
        login,
        email,
        userId: id,
      };
    }

    return null;
  }

  async getUsers(
    pageParams: PageSizeQueryModel
  ): Promise<PaginationViewModel<CreatedUserViewModel>> {
    const {
      sortBy,
      sortDirection,
      skip,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
    } = pageParams;

    const users = await this.usersRepository
      .createQueryBuilder()
      .select()
      .where('"login" ILIKE :searchLoginTerm', {
        searchLoginTerm: `%${searchLoginTerm}%`,
      })
      .orWhere('"email" ILIKE :searchEmailTerm', {
        searchEmailTerm: `%${searchEmailTerm}%`,
      })
      .orderBy(
        `"${sortBy}"`,
        `${sortDirection.toUpperCase()}` as "ASC" | "DESC"
      )
      .skip(skip)
      .take(pageSize)
      .getMany();

    const count = await this.usersRepository
      .createQueryBuilder()
      .where('"login" ILIKE :searchLoginTerm', {
        searchLoginTerm: `%${searchLoginTerm}%`,
      })
      .orWhere('"email" ILIKE :searchEmailTerm', {
        searchEmailTerm: `%${searchEmailTerm}%`,
      })
      .getCount();

    return Paginated.transformPagination<CreatedUserViewModel>(
      {
        ...pageParams,
        totalCount: +count,
      },
      users.map((user) => this.getUserViewModel(user))
    );
  }
}
