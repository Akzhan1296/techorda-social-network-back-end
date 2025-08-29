import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { v4 as uuidv4 } from "uuid";
import { DeleteBlogBySAUseCase } from "./sa.delete-blog.use-case";
import { BlogsRepo } from "../../../../../infrstructura/blogs/blogs.adapter";
import { Blog } from "../../../../../entity/blogs-entity";
import { DeleteResult } from "typeorm";

describe("Delete blog use case", () => {
  let app: TestingModule;
  let deleteBlogUseCase: DeleteBlogBySAUseCase;
  let blogsRepo: BlogsRepo;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    deleteBlogUseCase = app.get<DeleteBlogBySAUseCase>(DeleteBlogBySAUseCase);
    blogsRepo = app.get<BlogsRepo>(BlogsRepo);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(deleteBlogUseCase).toBeDefined();
    expect(blogsRepo).toBeDefined();
  });

  it("Should delete blog succesfully ", async () => {
    const blogId = uuidv4();

    jest
      .spyOn(blogsRepo, "findBlogById")
      .mockImplementation(async () => ({ id: blogId }) as Blog);

    jest
      .spyOn(blogsRepo, "deleteBlog")
      .mockImplementation(async () => ({ raw: "" }) as DeleteResult);

    const result = await deleteBlogUseCase.execute({
      deleteBlogDTO: {
        blogId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isBlogDeleted: true,
    });
  });

  it("Should return 404 error", async () => {
    const blogId = uuidv4();

    jest.spyOn(blogsRepo, "findBlogById").mockImplementation(async () => null);

    const result = await deleteBlogUseCase.execute({
      deleteBlogDTO: {
        blogId,
      },
    });
    expect(result).toEqual({
      isBlogFound: false,
      isBlogDeleted: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
