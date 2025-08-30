import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import {
  AuthLoginInputModal,
  AuthRegistrationInputModal,
} from "../../src/features/roles/public/auth/api/auth.models";
import { DeleteDataController } from "../../src/features/infrstructura/deleting-all-data";
import { v4 as uuidv4 } from "uuid";
import { initTestApp } from "../init.app";
import { mockRequest, mockResponse } from "../__test-data__";

describe("Devices", () => {
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

  it("Get devices list ", async () => {
    // adding user by SA
    await request(app.getHttpServer())
      .post("/sa/users")
      .auth("admin", "qwerty", { type: "basic" })
      .send({
        login: "login1",
        password: "password",
        email: "login1@login.com",
      } as AuthRegistrationInputModal)
      .expect(HttpStatus.CREATED);

    //auth user
    const result = await request(app.getHttpServer())
      .post("/auth/login")
      .set("user-agent", `deviceName${new Date()}`)
      .send({
        loginOrEmail: "login1",
        password: "password",
      } as AuthLoginInputModal);

    const refreshToken = result.headers["set-cookie"][0].split("=")[1];

    await request(app.getHttpServer())
      .get("/security/devices")
      .set("Cookie", `refreshToken=${refreshToken}`)
      .then(({ body }) => {
        expect(body).toHaveLength(1);
      });
  });

  it("Deleting all  devices except current", async () => {
    // adding user by SA
    // user login123
    await request(app.getHttpServer())
      .post("/sa/users")
      .auth("admin", "qwerty", { type: "basic" })
      .send({
        login: "login123",
        password: "password",
        email: "login1@login.com",
      } as AuthRegistrationInputModal)
      .expect(HttpStatus.CREATED);

    //auth user
    // auth user login123 with device 1
    const result = await request(app.getHttpServer())
      .post("/auth/login")
      .set("user-agent", `deviceName1234`)
      .send({
        loginOrEmail: "login123",
        password: "password",
      } as AuthLoginInputModal);

    // auth user login123 with device 2
    await request(app.getHttpServer())
      .post("/auth/login")
      .set("user-agent", `deviceName12345`)
      .send({
        loginOrEmail: "login123",
        password: "password",
      } as AuthLoginInputModal);

    const refreshToken = result.headers["set-cookie"][0].split("=")[1];

    // get gevice id
    const devices = await request(app.getHttpServer())
      .get("/security/devices")
      .set("Cookie", `refreshToken=${refreshToken}`);

    expect(devices.body).toHaveLength(2);

    // delete current device by id
    await request(app.getHttpServer())
      .delete(`/security/devices`)
      .set("Cookie", `refreshToken=${refreshToken}`)
      .expect(HttpStatus.NO_CONTENT);

    // get gevice id
    const devices1 = await request(app.getHttpServer())
      .get("/security/devices")
      .set("Cookie", `refreshToken=${refreshToken}`);

    expect(devices1.body).toHaveLength(1);
  });
  describe("Deleting device by ID", () => {
    it("Shoud delete user's current device by ID", async () => {
      // adding user by SA
      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          login: "login1",
          password: "password",
          email: "login1@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      //auth user
      const result = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)

        .send({
          loginOrEmail: "login1",
          password: "password",
        } as AuthLoginInputModal);

      const refreshToken = result.headers["set-cookie"][0].split("=")[1];

      // get gevice id
      const devices = await request(app.getHttpServer())
        .get("/security/devices")
        .set("Cookie", `refreshToken=${refreshToken}`);

      expect(devices.body).toHaveLength(1);

      // delete current device by id
      await request(app.getHttpServer())
        .delete(`/security/devices/${devices.body[0].deviceId}`)
        .set("Cookie", `refreshToken=${refreshToken}`)
        .expect(HttpStatus.NO_CONTENT);

      // should get 401
      await request(app.getHttpServer())
        .get("/security/devices")
        .set("Cookie", `refreshToken=${refreshToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("Shoud return 403 error, if user try to delete somebody's device", async () => {
      // adding user by SA
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

      //auth user 1
      const result = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login1",
          password: "password",
        } as AuthLoginInputModal);

      const refreshToken = result.headers["set-cookie"][0].split("=")[1];

      // get gevice id for user 1
      const devices = await request(app.getHttpServer())
        .get("/security/devices")
        .set("Cookie", `refreshToken=${refreshToken}`);

      expect(devices.body).toHaveLength(1);

      //auth user 2
      const result2 = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login2",
          password: "password",
        } as AuthLoginInputModal);

      const refreshToken2 = result2.headers["set-cookie"][0].split("=")[1];

      // delete current device by id
      await request(app.getHttpServer())
        .delete(`/security/devices/${devices.body[0].deviceId}`)
        .set("Cookie", `refreshToken=${refreshToken2}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it("Shoud return 404 error, if no device", async () => {
      // adding user by SA
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

      //auth user 1
      const result = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)

        .send({
          loginOrEmail: "login1",
          password: "password",
        } as AuthLoginInputModal);

      const refreshToken = result.headers["set-cookie"][0].split("=")[1];

      // try to delete with no id
      await request(app.getHttpServer())
        .delete(`/security/devices/${uuidv4()}`)
        .set("Cookie", `refreshToken=${refreshToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  afterAll(async () => {
    await deleteDataController.deleteTestData(mockRequest, mockResponse);
    await app.close();
  });
});
