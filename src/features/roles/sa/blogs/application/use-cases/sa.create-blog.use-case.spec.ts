import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { v4 as uuidv4 } from "uuid";
import { CreateBlogBySAUseCase } from "./sa.create-blog.use-case";
import { BlogsRepo } from "../../../../../infrstructura/blogs/blogs.adapter";
import { Blog } from "../../../../../entity/blogs-entity";

describe("Create blog use case", () => {
  let app: TestingModule;
  let createBloguseCase: CreateBlogBySAUseCase;
  let blogsRepo: BlogsRepo;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    createBloguseCase = app.get<CreateBlogBySAUseCase>(CreateBlogBySAUseCase);
    blogsRepo = app.get<BlogsRepo>(BlogsRepo);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(createBloguseCase).toBeDefined();
    expect(blogsRepo).toBeDefined();
  });

  it("Should create blog succesfully ", async () => {
    const blogId = uuidv4();

    jest
      .spyOn(blogsRepo, "saveBlog")
      .mockImplementation(async () => ({ id: blogId }) as Blog);

    const result = await createBloguseCase.execute({
      createBlogDTO: {
        name: "blog name",
        description: "blog description",
        websiteUrl: "website url",
      },
    });

    expect(result).toEqual({
      createdBlogId: blogId,
      isBlogCreated: true,
    });
  });
  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
