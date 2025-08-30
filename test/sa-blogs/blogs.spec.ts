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
import {
  CreateBlogInputModelType,
  CreatePostInputType,
} from "../../src/features/roles/sa/blogs/api/sa.blogs.models";
import { v4 as uuidv4 } from "uuid";

describe("Blogs", () => {
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

  describe("Create blogs by SA", () => {
    it("Should create blog successfully", () => {
      return request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);
    });
    it("Should return 401 if no headers", () => {
      return request(app.getHttpServer())
        .post("/sa/blogs")
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it("Should return 400 error, validation errors", async () => {
      return request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          name: "",
          websiteUrl: "",
          description: "",
        } as CreateBlogInputModelType)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(2);
          expect(body.errorsMessages).toEqual([
            {
              field: "name",
              message: "name should not be empty",
            },
            {
              field: "websiteUrl",
              message:
                "websiteUrl must match ^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$ regular expression",
            },
          ]);
        });
    });
    it("Should get blogs list", async () => {
      await request(app.getHttpServer())
        .get("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 0,
              page: 1,
              pageSize: 10,
              pagesCount: 0,
            }),
          );
        });

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });
    });
  });

  describe("Update blog by SA", () => {
    it("Should update succesfully", async () => {
      let blogId = null;

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
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

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blogId}`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          ...creatingBlogMock,
          name: "updated name",
        } as CreateBlogInputModelType)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .get("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === "updated name"),
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
    });

    it("Should return 404 error, if blog not found", async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${uuidv4()}`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          ...creatingBlogMock,
          name: "updated name",
        } as CreateBlogInputModelType)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("Delete blog by SA", () => {
    it("Should delete succesfully", async () => {
      let blogId = null;

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
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

      await request(app.getHttpServer())
        .delete(`/sa/blogs/${blogId}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .get("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 0,
              page: 1,
              pageSize: 10,
              pagesCount: 0,
            }),
          );
        });
    });

    it("Should return 404 error, if blog not found", async () => {
      await request(app.getHttpServer())
        .delete(`/sa/blogs/${uuidv4()}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("Create post by blogId", () => {
    it("Should create post successfully", async () => {
      let blogId = null;

      // blog 1
      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
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

      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.body).toEqual(
        expect.objectContaining({
          title: "post title",
          shortDescription: "shortDescription",
          content: "content",
          blogId,
          blogName: "blog name",
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [],
          },
        }),
      );
    });

    it("Should return 401 if no headers", async () => {
      const blogId = uuidv4();
      await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .send(createPostMock as CreatePostInputType)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("Should return 404, if blog not found", async () => {
      const blogId = uuidv4();
      await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType)
        .expect(HttpStatus.NOT_FOUND);
    });

    it("Should return 400 error, validation errors", async () => {
      let blogId = null;

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name),
          ).toBeTruthy();
        });

      await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send()
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(3);
          expect(body.errorsMessages).toEqual([
            {
              field: "title",
              message: "title must be shorter than or equal to 30 characters",
            },
            {
              field: "shortDescription",
              message:
                "shortDescription must be shorter than or equal to 100 characters",
            },
            {
              field: "content",
              message:
                "content must be shorter than or equal to 1000 characters",
            },
          ]);
        });
    });
  });

  describe("Update post by blogId", () => {
    it("Should update post successfully", async () => {
      let blogId = null;
      let postId = null;

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
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

      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.body).toEqual(
        expect.objectContaining({
          title: "post title",
          shortDescription: "shortDescription",
          content: "content",
          blogId,
          blogName: "blog name",
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [],
          },
        }),
      );

      postId = result.body.id;

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({ ...createPostMock, title: "updated " } as CreatePostInputType)
        .expect(HttpStatus.NO_CONTENT);
    });

    it("Should return 401 if no headers", async () => {
      const blogId = uuidv4();
      const postId = uuidv4();

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blogId}/posts/${postId}`)
        .send(createPostMock as CreatePostInputType)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("Should return 404, if blog not found", async () => {
      const blogId = uuidv4();
      const postId = uuidv4();

      await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType)
        .expect(HttpStatus.NOT_FOUND);
    });

    it("Should return 400 error, validation errors", async () => {
      let blogId = null;
      let postId = null;

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
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

      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.body).toEqual(
        expect.objectContaining({
          title: "post title",
          shortDescription: "shortDescription",
          content: "content",
          blogId,
          blogName: "blog name",
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [],
          },
        }),
      );

      postId = result.body.id;

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({} as CreatePostInputType)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(3);
          expect(body.errorsMessages).toEqual([
            {
              field: "title",
              message: "title must be shorter than or equal to 30 characters",
            },
            {
              field: "shortDescription",
              message:
                "shortDescription must be shorter than or equal to 100 characters",
            },
            {
              field: "content",
              message:
                "content must be shorter than or equal to 1000 characters",
            },
          ]);
        });
    });
  });

  describe("Delete post by blog and post ids", () => {
    it("Should delete post", async () => {
      let blogId = null;
      let postId = null;

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
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

      const result = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .send(createPostMock as CreatePostInputType);

      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.body).toEqual(
        expect.objectContaining({
          title: "post title",
          shortDescription: "shortDescription",
          content: "content",
          blogId,
          blogName: "blog name",
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [],
          },
        }),
      );

      postId = result.body.id;

      await request(app.getHttpServer())
        .get(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            }),
          );
        });

      await request(app.getHttpServer())
        .delete(`/sa/blogs/${blogId}/posts/${postId}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .get(`/sa/blogs/${blogId}/posts`)
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 0,
              page: 1,
              pageSize: 10,
              pagesCount: 0,
            }),
          );
        });
    });
    it("Should return 404, if post not found", async () => {
      let blogId = null;

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
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

      await request(app.getHttpServer())
        .delete(`/sa/blogs/${blogId}/posts/${uuidv4()}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(HttpStatus.NOT_FOUND);
    });
    it("Should return 404, if blog not found", async () => {
      await request(app.getHttpServer())
        .delete(`/sa/blogs/${uuidv4()}/posts/${uuidv4()}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  afterAll(async () => {
    await deleteDataController.deleteTestData(mockRequest, mockResponse);
    await app.close();
  });
});
