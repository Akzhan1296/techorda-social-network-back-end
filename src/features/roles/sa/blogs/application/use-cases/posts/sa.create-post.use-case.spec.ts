import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../../app.module";
import { v4 as uuidv4 } from "uuid";
import { CreatePostBySAUseCase } from "./sa.create-post.use-case";
import { BlogsRepo } from "../../../../../../infrstructura/blogs/blogs.adapter";
import { PostsRepo } from "../../../../../../infrstructura/posts/posts.adapter";
import { Post } from "../../../../../../entity/posts-entity";

describe("Create post use case", () => {
  let app: TestingModule;
  let createPostUseCase: CreatePostBySAUseCase;
  let blogsRepo: BlogsRepo;
  let postsRepo: PostsRepo;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    createPostUseCase = app.get<CreatePostBySAUseCase>(CreatePostBySAUseCase);
    blogsRepo = app.get<BlogsRepo>(BlogsRepo);
    postsRepo = app.get<PostsRepo>(PostsRepo);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(createPostUseCase).toBeDefined();
    expect(blogsRepo).toBeDefined();
    expect(postsRepo).toBeDefined();
  });

  it("Should create post succesfully ", async () => {
    const blogId = uuidv4();
    const postId = uuidv4();

    jest
      .spyOn(blogsRepo, "findBlogById")
      .mockImplementation(async () => blogId);
    jest
      .spyOn(postsRepo, "savePost")
      .mockImplementation(async () => ({ id: postId }) as Post);

    const result = await createPostUseCase.execute({
      createPostDTO: {
        title: "title",
        shortDescription: "shortDescription",
        content: "content",
        blogId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isPostCreated: true,
      createdPostId: postId,
    });
  });
  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
