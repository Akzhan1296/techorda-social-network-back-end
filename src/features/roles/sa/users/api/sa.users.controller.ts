import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { CreateUserCommand } from "../application/use-cases/create-user-use-case";
import { AddUserInputModel, UsersQueryType } from "./sa.users.models";
import { CreatedUserViewModel } from "../../../../infrstructura/users/models/users.models";
import { DeleteUserCommand } from "../application/use-cases/delete-user-use-case";
import { DeleteUserResultDTO } from "../application/users.dto";
import { PaginationViewModel, ValidId } from "../../../../../common/types";
import { AuthBasicGuard } from "../../../../../guards/authBasic.guard";
import { UsersQueryRepo } from "../../../../infrstructura/users/users.query.adapter";

@Controller("sa/users")
@UseGuards(AuthBasicGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersQueryRepo: UsersQueryRepo,
  ) {}

  @Get()
  async getUsers(
    @Query() pageSize: UsersQueryType,
  ): Promise<PaginationViewModel<CreatedUserViewModel>> {
    return this.usersQueryRepo.getUsers(pageSize);
  }

  // create user by SA
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() inputModel: AddUserInputModel,
  ): Promise<CreatedUserViewModel> {
    const { email, login, id, createdAt } = await this.commandBus.execute(
      new CreateUserCommand({
        login: inputModel.login,
        email: inputModel.email,
        password: inputModel.password,
      }),
    );
    return { email, login, id, createdAt };
  }

  // delete user by SA
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param() params: ValidId): Promise<boolean> {
    const { isUserFound, isUserDeleted } = await this.commandBus.execute<
      unknown,
      DeleteUserResultDTO
    >(new DeleteUserCommand(params.id));

    if (!isUserFound) {
      throw new NotFoundException("User by this confirm code not found");
    }
    return isUserDeleted;
  }
}
