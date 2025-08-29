import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { DeleteDataController } from "../../src/features/infrstructura/deleting-all-data";
import { initTestApp } from "../init.app";
import {
  createPostMock,
  creatingBlogMock,
  mockRequest,
  mockResponse,
} from "../__test-data__";
import { v4 as uuidv4 } from "uuid";
import {
  CreateBlogInputModelType,
  CreatePostInputType,
} from "../../src/features/roles/sa/blogs/api/sa.blogs.models";
import {
  AuthLoginInputModal,
  AuthRegistrationInputModal,
} from "../../src/features/roles/public/auth/api/auth.models";

describe("Comments", () => {
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

  describe("Create comment", () => {
    it("Should create comment successfully", async () => {
      let blogId = null;
      let postId = null;
      let accessToken: null | string = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      accessToken = authResult.body.accessToken as string;

      await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.CREATED);
    });
    it("Should NOT create comment, if user not authorized", async () => {
      let blogId = null;
      let postId = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

      await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it("Should return 404, if post not found", async () => {
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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      const accessToken = authResult.body.accessToken as string;

      await request(app.getHttpServer())
        .post(`/posts/${uuidv4()}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.NOT_FOUND);
    });
    it("Should return 400, if inputs are invalid", async () => {
      let blogId = null;
      let postId = null;
      let accessToken: null | string = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      accessToken = authResult.body.accessToken as string;

      await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "content",
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("Handle comment like", () => {
    it("Should add like for comment, if comment found", async () => {
      let blogId = null;
      let postId = null;
      let accessToken: null | string = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      accessToken = authResult.body.accessToken as string;

      const commentResult = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.CREATED);

      // like status
      await request(app.getHttpServer())
        .put(`/comments/${commentResult.body.id}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          likeStatus: "Like",
        })
        .expect(HttpStatus.NO_CONTENT);
    });
    it("Should return 401, if not authorized", async () => {
      await request(app.getHttpServer())
        .put(`/comments/${uuidv4()}/like-status`)
        .send({
          likeStatus: "None",
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it("Should return 404, if comment not found", async () => {
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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      const accessToken = authResult.body.accessToken as string;

      await request(app.getHttpServer())
        .put(`/comments/${uuidv4()}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          likeStatus: "None",
        })
        .expect(HttpStatus.NOT_FOUND);
    });
    it("Should return 400, if inputs are invalid", async () => {
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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      const accessToken = authResult.body.accessToken as string;

      await request(app.getHttpServer())
        .put(`/comments/${uuidv4()}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          likeStatus: "Qwerty",
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it("Should add like for comment, and return by owner, CHECK my status (Like)", async () => {
      let blogId = null;
      let postId = null;
      let accessToken: null | string = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      accessToken = authResult.body.accessToken as string;

      const commentResult = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.CREATED);

      // like status
      await request(app.getHttpServer())
        .put(`/comments/${commentResult.body.id}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          likeStatus: "Like",
        })
        .expect(HttpStatus.NO_CONTENT);

      const commentView = await request(app.getHttpServer())
        .get(`/comments/${commentResult.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(commentView.body).toEqual({
        id: commentResult.body.id,
        content: "contentcontentcontentcontentcontentcontent",
        commentatorInfo: {
          userLogin: "login12345",
          userId: expect.any(String),
        },
        createdAt: expect.any(String),
        likesInfo: { likesCount: 1, dislikesCount: 0, myStatus: "Like" },
      });
    });
    it("Should add like for comment by authorized user, and get by not authorized user, CHECK my status (None)", async () => {
      let blogId = null;
      let postId = null;
      let accessToken: null | string = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      accessToken = authResult.body.accessToken as string;

      const commentResult = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.CREATED);

      // like status
      await request(app.getHttpServer())
        .put(`/comments/${commentResult.body.id}/like-status`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          likeStatus: "Like",
        })
        .expect(HttpStatus.NO_CONTENT);

      const commentView = await request(app.getHttpServer()).get(
        `/comments/${commentResult.body.id}`,
      );

      expect(commentView.body).toEqual({
        id: commentResult.body.id,
        content: "contentcontentcontentcontentcontentcontent",
        commentatorInfo: {
          userLogin: "login12345",
          userId: expect.any(String),
        },
        createdAt: expect.any(String),
        likesInfo: { likesCount: 1, dislikesCount: 0, myStatus: "None" },
      });
    });
    it("Should return 404, if comment not found (get comment by ID)", async () => {
      await request(app.getHttpServer())
        .get(`/comments/${uuidv4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("Delete comment", () => {
    it("Should delete comment successfully", async () => {
      let blogId = null;
      let postId = null;
      let accessToken: null | string = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      accessToken = authResult.body.accessToken as string;

      const commentResult = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .delete(`/comments/${commentResult.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.NO_CONTENT);
    });
    it("Should return 403 error", async () => {
      let blogId = null;
      let postId = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      // add user 2
      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          password: "password",
          login: "user2",
          email: "email@email.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      const auth2Result = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "user2",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      const accessToken = authResult.body.accessToken as string;

      const accessToken2 = auth2Result.body.accessToken as string;

      const commentResult = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .delete(`/comments/${commentResult.body.id}`)
        .set("Authorization", `Bearer ${accessToken2}`)
        .expect(HttpStatus.FORBIDDEN);
    });
    it("Should return 404 error", async () => {
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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      const accessToken = authResult.body.accessToken as string;

      await request(app.getHttpServer())
        .delete(`/comments/${uuidv4()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
    it("Should return 401 error", async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${uuidv4()}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("Update comment", () => {
    it("Should update comment successfully", async () => {
      let blogId = null;
      let postId = null;
      let accessToken: null | string = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      accessToken = authResult.body.accessToken as string;

      const commentResult = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .put(`/comments/${commentResult.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "1111111111111111111111111111111" })
        .expect(HttpStatus.NO_CONTENT);

      const { body } = await request(app.getHttpServer()).get(
        `/comments/${commentResult.body.id}`,
      );

      expect(body).toEqual(
        expect.objectContaining({
          content: "1111111111111111111111111111111",
        }),
      );
    });
    it("Should return 403 error", async () => {
      let blogId = null;
      let postId = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      // add user 2
      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          password: "password",
          login: "user2",
          email: "email@email.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      const auth2Result = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "user2",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      const accessToken = authResult.body.accessToken as string;

      const accessToken2 = auth2Result.body.accessToken as string;

      const commentResult = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .put(`/comments/${commentResult.body.id}`)
        .set("Authorization", `Bearer ${accessToken2}`)
        .send({ content: "1111111111111111111111111111111" })
        .expect(HttpStatus.FORBIDDEN);
    });
    it("Should return 404 error", async () => {
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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      const accessToken = authResult.body.accessToken as string;

      await request(app.getHttpServer())
        .delete(`/comments/${uuidv4()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
    it("Should return 401 error", async () => {
      await request(app.getHttpServer())
        .put(`/comments/${uuidv4()}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it("Should return 400 error", async () => {
      let blogId = null;
      let postId = null;
      let accessToken: null | string = null;

      // create blog
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      // get blog id
      await request(app.getHttpServer())
        .get("/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      // create post
      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      postId = result.body.id;

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
      const authResult = await request(app.getHttpServer())
        .post("/auth/login")
        .set("user-agent", `deviceName${new Date()}`)
        .send({
          loginOrEmail: "login12345",
          password: "password",
        } as AuthLoginInputModal)
        .expect(HttpStatus.OK);

      accessToken = authResult.body.accessToken as string;

      const commentResult = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "contentcontentcontentcontentcontentcontent",
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .put(`/comments/${commentResult.body.id}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ content: "" })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(1);
          expect(body.errorsMessages).toEqual([
            {
              field: "content",
              message: "content must be longer than or equal to 20 characters",
            },
          ]);
        });
    });
  });

  afterAll(async () => {
    await deleteDataController.deleteTestData(mockRequest, mockResponse);
    await app.close();
  });
});
