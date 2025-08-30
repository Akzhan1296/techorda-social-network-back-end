import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import {
  ConfirmRegistrationEntryDTO,
  CreateUserEntryDTO,
  CreatedUserViewModel,
  NewConfirmCodeEntryDTO,
  NewPasswordDTO,
  RegistrationEntryDTO,
  RegistrationViewDTO,
  RegistrationWithUserViewDTO,
  UserViewDTO,
} from "./models/users.models";

// outdated
export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  // user table
  async findUserByEmail(email: string): Promise<UserViewDTO | null> {
    // Users table
    const result = await this.dataSource.query(
      `
    SELECT "Id", "Login", "Password", "Email"
	  FROM public."Users"
	  WHERE "Email" like $1`,
      [email],
    );

    if (result.length === 0) return null;
    return {
      id: result[0].Id,
      login: result[0].Login,
      password: result[0].Password,
      email: result[0].Email,
    };
  }

  // user table
  async findUserByLogin(login: string): Promise<UserViewDTO | null> {
    // Users table
    const result = await this.dataSource.query(
      `
    SELECT "Id", "Login", "Password", "Email"
	  FROM public."Users"
	  WHERE "Login" like $1`,
      [login],
    );

    if (result.length === 0) return null;
    return {
      id: result[0].Id,
      login: result[0].Login,
      password: result[0].Password,
      email: result[0].Email,
    };
  }

  // user table
  async findUserById(id: string): Promise<UserViewDTO | null> {
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
      id: result[0].Id,
      login: result[0].Login,
      password: result[0].Password,
      email: result[0].Email,
    };
  }

  // registration table
  async findRegistrationDataByConfirmCode(
    code: string,
  ): Promise<RegistrationViewDTO | null> {
    // registration table
    const result = await this.dataSource.query(
      ` SELECT "Id", "ConfirmCode", "IsConfirmed", "EmailExpDate", "CreatedAt", "UserId"
	      FROM public."Registration"
	      WHERE "ConfirmCode" like $1`,
      [code],
    );

    if (result.length === 0) return null;

    return {
      createdAt: result[0].CreatedAt,
      emailExpDate: result[0].EmailExpDate,
      isConfirmed: result[0].IsConfirmed,
      confirmCode: result[0].ConfirmCode,
      registrationId: result[0].Id,
      userId: result[0].UserId,
    };
  }

  // registration + user tables
  async findUserRegistrationDataByEmail(
    email: string,
  ): Promise<RegistrationWithUserViewDTO | null> {
    const result = await this.dataSource.query(
      `SELECT r.*, u."Email"
        FROM public."Registration" r
        LEFT JOIN public."Users" u
        on r."UserId" = u."Id"
        WHERE u."Email" = $1`,
      [email],
    );

    if (!result.length) return null;

    return {
      registrationId: result[0].Id,
      confirmCode: result[0].ConfirmCode,
      isConfirmed: result[0].IsConfirmed,
      emailExpDate: result[0].EmailExpDate,
      createdAt: result[0].CreatedAt,
      userId: result[0].UserId,
      email: result[0].Email,
    };
  }

  // registration table
  async findRegistrationDataByUserId(userId: string): Promise<string | null> {
    const result = await this.dataSource.query(
      `
    SELECT "Id"
	  FROM public."Registration"
	  WHERE "UserId" = $1`,
      [userId],
    );

    if (!result.length) return null;
    return result[0].Id;
  }

  // user table
  async createUser(
    creationUser: CreateUserEntryDTO,
  ): Promise<CreatedUserViewModel> {
    const { login, passwordHash, email, createdAt } = creationUser;

    const result = await this.dataSource.query(
      `INSERT INTO public."Users"(
      "Login", "Password", "Email", "CreatedAt")
      VALUES ($1, $2, $3, $4)
      RETURNING "Id", "Email", "CreatedAt", "Login";`,
      [login, passwordHash, email, createdAt],
    );
    return {
      id: result[0].Id,
      login: result[0].Login,
      createdAt: result[0].CreatedAt,
      email: result[0].Email,
    };
  }

  // registration table
  async registrationUser(
    registrationUser: RegistrationEntryDTO,
  ): Promise<boolean> {
    const { confirmCode, isConfirmed, emailExpDate, createdAt, userId } =
      registrationUser;

    const result = await this.dataSource.query(
      `INSERT INTO public."Registration"(
      "ConfirmCode", "IsConfirmed", "EmailExpDate", "CreatedAt", "UserId")
	    VALUES ($1, $2, $3, $4, $5)
      RETURNING "Id"`,
      [confirmCode, isConfirmed, emailExpDate, createdAt, userId],
    );

    return result[0];
  }

  // registratino table
  async confirmRegistration(
    registrationConfirmation: ConfirmRegistrationEntryDTO,
  ): Promise<boolean> {
    const { confirmCode, isConfirmed } = registrationConfirmation;

    const result = await this.dataSource.query(
      `UPDATE public."Registration"
        SET "IsConfirmed"= $2
        WHERE "ConfirmCode" = $1`,
      [confirmCode, isConfirmed],
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  // registration table
  async setNewConfirmCode(
    newConfirmCode: NewConfirmCodeEntryDTO,
  ): Promise<boolean> {
    const { confirmCode, emailExpDate, registrationId } = newConfirmCode;

    const result = await this.dataSource.query(
      `UPDATE public."Registration"
        SET "ConfirmCode"= $1, "EmailExpDate"= $2
        WHERE "Id" = $3`,
      [confirmCode, emailExpDate, registrationId],
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  async setNewPassword(newPasswordDTO: NewPasswordDTO): Promise<boolean> {
    const { passwordHash, userId } = newPasswordDTO;

    const result = await this.dataSource.query(
      `UPDATE public."Users"
        SET "Password"= $1
        WHERE "Id" = $2`,
      [passwordHash, userId],
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  //user table
  async deleteUser(userId: string) {
    await this.dataSource.query(
      ` 
	      DELETE FROM public."Users"
	      WHERE "Id" = $1
        `,
      [userId],
    );
  }

  // long way of method
  // registration table
  deleteRegistration = async function (regestrationId: string) {
    await this.dataSource.query(
      ` 
	      DELETE FROM public."Registration"
	      WHERE "Id" = $1
        `,
      [regestrationId],
    );
  };
}

// Ivan
// blog
//controller
// sa-blogs
// public-blogs
// use-cases

// Akzhan
// roles
//sa -> features -> blogs -> use-cases (DDD)
// -> posts -> use-cases (DDD)

//public -> features -> blogs -> use-cases (DDD)
// -> posts -> use-cases (DDD)

//infro
// blogs
// post

// E2E
// unit

// nest
// typeorm
// postgress (СУБД)
// SQL
