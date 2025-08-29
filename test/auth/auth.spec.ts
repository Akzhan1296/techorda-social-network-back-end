import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import {
  AuthEmailResendingInputModal,
  AuthLoginInputModal,
  AuthRegistrationConfirmInputModal,
  AuthRegistrationInputModal,
} from "../../src/features/roles/public/auth/api/auth.models";
import { v4 as uuidv4 } from "uuid";
import { DeleteDataController } from "../../src/features/infrstructura/deleting-all-data";
import { initTestApp } from "../init.app";
import {
  mockRequest,
  mockResponse,
  registrationUser,
  userByConfirmCodeMock,
  userByEmailMock,
} from "../__test-data__";
import { UsersRepo } from "../../src/features/infrstructura/users/users.adapter";
import { Registration } from "../../src/features/entity/registration-entity";

describe("Auth", () => {
  let app: INestApplication;
  let usersRepo: UsersRepo;
  let deleteDataController: DeleteDataController;

  beforeAll(async () => {
    app = await initTestApp();
    await app.init();
    usersRepo = app.get<UsersRepo>(UsersRepo);
    deleteDataController = app.get<DeleteDataController>(DeleteDataController);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await deleteDataController.deleteTestData(mockRequest, mockResponse);
  });

  it("Should get user info", async () => {
    // adding user by SA
    await request(app.getHttpServer())
      .post("/sa/users")
      .auth("admin", "qwerty", { type: "basic" })
      .send({
        login: "login123",
        password: "password",
        email: "login123@login.com",
      } as AuthRegistrationInputModal)
      .expect(HttpStatus.CREATED);

    //auth user
    const result = await request(app.getHttpServer())
      .post("/auth/login")
      .set("user-agent", `deviceName${new Date()}`)
      .send({
        loginOrEmail: "login123",
        password: "password",
      } as AuthLoginInputModal);

    const accessToken = result.body.accessToken;

    //get added user info
    await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            login: "login123",
            email: "login123@login.com",
          }),
        );
      });
  });

  describe("Registration flow", () => {
    it("Should registrate user successfully", () => {
      return request(app.getHttpServer())
        .post("/auth/registration")
        .send(registrationUser as AuthRegistrationInputModal)
        .expect(HttpStatus.NO_CONTENT);
    });

    it("Should return 400, class validator errors", async () => {
      return request(app.getHttpServer())
        .post("/auth/registration")
        .send({
          login: "",
          email: "123",
          password: "1235678",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(2);
          expect(body.errorsMessages).toEqual([
            {
              field: "login",
              message: "login must be longer than or equal to 3 characters",
            },
            {
              field: "email",
              message:
                "email must match /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/ regular expression",
            },
          ]);
        });
    });
  });

  describe("Registration confirmation flow", () => {
    it("Should confirm registration successfully", () => {
      jest
        .spyOn(usersRepo, "findRegistrationDataByConfirmCode")
        .mockImplementation(
          async () => userByConfirmCodeMock as unknown as Registration,
        );

      jest
        .spyOn(usersRepo, "saveRegistration")
        .mockImplementation(
          async () => userByConfirmCodeMock as unknown as Registration,
        );

      return request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({
          code: "45dff427-ccdd-49df-9e9d-c6b407538137",
        } as AuthRegistrationConfirmInputModal)
        .expect(HttpStatus.NO_CONTENT);
    });

    it("Should return 404 error ", () => {
      jest
        .spyOn(usersRepo, "findRegistrationDataByConfirmCode")
        .mockImplementation(async () => null);
      return request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({
          code: uuidv4(), //should be different code
        } as AuthRegistrationConfirmInputModal)
        .expect(HttpStatus.NOT_FOUND);
    });

    it("Should return 400 error", async () => {
      jest
        .spyOn(usersRepo, "findRegistrationDataByConfirmCode")
        .mockImplementation(
          async () =>
            ({
              ...userByConfirmCodeMock,
              isConfirmed: true,
            }) as unknown as Registration,
        );

      request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({
          code: "45dff427-ccdd-49df-9e9d-c6b407538137",
        } as AuthRegistrationConfirmInputModal)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(1);
          expect(body.errorsMessages).toEqual([
            {
              field: "code",
              message: "Email is already confirmed",
            },
          ]);
        });
    });
  });

  describe("Confirm email resending", () => {
    it("Should resend email", () => {
      jest
        .spyOn(usersRepo, "findUserRegistrationDataByEmail")
        .mockImplementation(
          async () => userByEmailMock as unknown as Registration,
        );

      request(app.getHttpServer())
        .post("/auth/registration-email-resending")
        .send({
          email: "not-real-email@test.com",
        } as AuthEmailResendingInputModal)
        .expect(HttpStatus.NO_CONTENT);
    });

    it("Should return 400 error, if no headers", () => {
      jest
        .spyOn(usersRepo, "findUserRegistrationDataByEmail")
        .mockImplementation(async () => null);
      return request(app.getHttpServer())
        .post("/auth/registration-email-resending")
        .send({
          email: "not-3real-email@test.com",
        } as AuthEmailResendingInputModal)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("Should return 400 error, if email already confirmed", () => {
      jest
        .spyOn(usersRepo, "findUserRegistrationDataByEmail")
        .mockImplementation(
          async () =>
            ({
              ...userByEmailMock,
              isConfirmed: true,
            }) as unknown as Registration,
        );

      request(app.getHttpServer())
        .post("/auth/registration-email-resending")
        .send({
          email: "not-real-email@test.com",
        } as AuthEmailResendingInputModal)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(1);
          expect(body.errorsMessages).toEqual([
            {
              field: "email",
              message: "Email is already confirmed",
            },
          ]);
        });
    });
  });

  describe("Login flow", () => {
    it("Should create user successfully", async () => {
      // add user
      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          password: "password",
          login: "login12345",
          email: "email@email.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      //auth user
      await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);
    });

    it("Should refresh token successfully", async () => {
      // add user
      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          password: "password",
          login: "login123",
          email: "email@email.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      //auth user
      const result = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login123",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      const refreshToken = result.headers["set-cookie"][0].split("=")[1];

      // should return new refresh token
      await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Cookie", `refreshToken=${refreshToken}`)
        .expect(HttpStatus.OK);

      // should return 401,because old refresh token is used
      await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Cookie", `refreshToken=${refreshToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("Should log out", async () => {
      // add user
      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          password: "password",
          login: "login123",
          email: "email@email.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      //auth user
      const result = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login123",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      const refreshToken = result.headers["set-cookie"][0].split("=")[1];

      // log out
      await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Cookie", `refreshToken=${refreshToken}`)
        .expect(HttpStatus.NO_CONTENT);

      // should return 401,because user log out
      await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Cookie", `refreshToken=${refreshToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  afterAll(async () => {
    await deleteDataController.deleteTestData(mockRequest, mockResponse);
    await app.close();
  });
});

// TODO: implement E2E test cases
// new-password: registration user -> confirm registration -> auth -> (expect 401) -> recovery-password -> set new password -> auth (new password 200) -> auth (old)
