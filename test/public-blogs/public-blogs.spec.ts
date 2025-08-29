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

  it("Should get blogs list", async () => {
    // get list before creating
    await request(app.getHttpServer())
      .get("/blogs")
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

    // create blog
    await request(app.getHttpServer())
      .post("/sa/blogs")
      .auth("admin", "qwerty", { type: "basic" })
      .send(creatingBlogMock as CreateBlogInputModelType)
      .expect(HttpStatus.CREATED);

    // get list again and check that, list if different
    await request(app.getHttpServer())
      .get("/blogs")
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

  it("Should get blog by id", async () => {
    let blogId = null;

    // create blog
    await request(app.getHttpServer())
      .post("/sa/blogs")
      .auth("admin", "qwerty", { type: "basic" })
      .send(creatingBlogMock as CreateBlogInputModelType)
      .expect(HttpStatus.CREATED);

    // get blogs and get blogId
    await request(app.getHttpServer())
      .get("/blogs")
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
      .get(`/blogs/${blogId}`)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            ...creatingBlogMock,
            id: blogId,
          }),
        );
      });
  });

  it("Should get posts by blogId", async () => {
    let blogId = null;

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

    // get posts
    await request(app.getHttpServer())
      .get(`/blogs/${blogId}/posts`)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            totalCount: 1,
            page: 1,
            pageSize: 10,
            pagesCount: 1,
            items: expect.arrayContaining([
              expect.objectContaining({
                title: "post title",
                shortDescription: "shortDescription",
                content: "content",
                blogId: blogId,
                blogName: "blog name",
              }),
            ]),
          }),
        );
      });
  });

  afterAll(async () => {
    await deleteDataController.deleteTestData(mockRequest, mockResponse);
    await app.close();
  });
});
