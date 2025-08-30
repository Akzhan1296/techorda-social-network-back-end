import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { UpdateBlogBySAUseCase } from "./sa.update-blog.use-case";
import { v4 as uuidv4 } from "uuid";
import { BlogsRepo } from "../../../../../infrstructura/blogs/blogs.adapter";
import { Blog } from "../../../../../entity/blogs-entity";

describe("Update blog use case", () => {
  let app: TestingModule;
  let updateBlogUseCase: UpdateBlogBySAUseCase;
  let blogsRepo: BlogsRepo;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    updateBlogUseCase = app.get<UpdateBlogBySAUseCase>(UpdateBlogBySAUseCase);
    blogsRepo = app.get<BlogsRepo>(BlogsRepo);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(updateBlogUseCase).toBeDefined();
    expect(blogsRepo).toBeDefined();
  });

  it("Should update blog succesfully ", async () => {
    const blogId = uuidv4();

    jest
      .spyOn(blogsRepo, "findBlogById")
      .mockImplementation(async () => ({ id: blogId }) as Blog);

    jest
      .spyOn(blogsRepo, "saveBlog")
      .mockImplementation(async () => ({}) as Blog);

    const result = await updateBlogUseCase.execute({
      updateBlogDTO: {
        name: "blog name",
        description: "blog description",
        websiteUrl: "website url",
        blogId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isBlogUpdated: true,
    });
  });

  it("Should return 404 error", async () => {
    const blogId = uuidv4();

    jest.spyOn(blogsRepo, "findBlogById").mockImplementation(async () => null);

    const result = await updateBlogUseCase.execute({
      updateBlogDTO: {
        name: "blog name",
        description: "blog description",
        websiteUrl: "website url",
        blogId,
      },
    });
    expect(result).toEqual({
      isBlogFound: false,
      isBlogUpdated: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
