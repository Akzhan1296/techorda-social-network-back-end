import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { AuthRegistrationInputModal } from "../../src/features/roles/public/auth/api/auth.models";
import { DeleteDataController } from "../../src/features/infrstructura/deleting-all-data";
import { initTestApp } from "../init.app";
import { mockRequest, mockResponse, registrationUser } from "../__test-data__";

describe("Users", () => {
  let app: INestApplication;
  let deleteDataController: DeleteDataController;

  beforeAll(async () => {
    app = await initTestApp();
    await app.init();
    deleteDataController = app.get<DeleteDataController>(DeleteDataController);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await deleteDataController.deleteTestData(mockRequest, mockResponse);
  });

  describe("Create user by SA", () => {
    it("Should create user successfully", () => {
      return request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send(registrationUser as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);
    });

    it("Should return 401 if no headers", () => {
      return request(app.getHttpServer())
        .post("/sa/users")
        .send(registrationUser as AuthRegistrationInputModal)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("Should return 400 error, validation errors", async () => {
      return request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          password: "           ",
          email: "123",
          login: "",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(3);
          expect(body.errorsMessages).toEqual([
            {
              field: "login",
              message: "login must be longer than or equal to 3 characters",
            },
            {
              field: "password",
              message: "not valid password",
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

  describe("Gettings users by SA", () => {
    it("Get users", async () => {
      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          login: "login1",
          password: "password",
          email: "login1@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          login: "login2",
          password: "password",
          email: "login2@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 2,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });
    });
  });

  afterAll(async () => {
    await deleteDataController.deleteTestData(mockRequest, mockResponse);
    await app.close();
  });
});
