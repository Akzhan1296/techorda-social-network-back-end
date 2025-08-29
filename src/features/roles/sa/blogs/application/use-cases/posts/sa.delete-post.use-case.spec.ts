import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../../app.module";
import { v4 as uuidv4 } from "uuid";
import { DeletePostBySAUseCase } from "./sa.delete-post.use-case";
import { BlogsRepo } from "../../../../../../infrstructura/blogs/blogs.adapter";
import { PostsRepo } from "../../../../../../infrstructura/posts/posts.adapter";
import { DeleteResult } from "typeorm";

describe("Delete post use case", () => {
  let app: TestingModule;
  let deletePostUseCase: DeletePostBySAUseCase;
  let blogsRepo: BlogsRepo;
  let postsRepo: PostsRepo;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    deletePostUseCase = app.get<DeletePostBySAUseCase>(DeletePostBySAUseCase);
    blogsRepo = app.get<BlogsRepo>(BlogsRepo);
    postsRepo = app.get<PostsRepo>(PostsRepo);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(deletePostUseCase).toBeDefined();
    expect(blogsRepo).toBeDefined();
    expect(postsRepo).toBeDefined();
  });

  it("Should delete post succesfully ", async () => {
    const blogId = uuidv4();
    const postId = uuidv4();

    jest
      .spyOn(blogsRepo, "findBlogById")
      .mockImplementation(async () => blogId);
    jest
      .spyOn(postsRepo, "findPostById")
      .mockImplementation(async () => postId);

    jest
      .spyOn(postsRepo, "deletePost")
      .mockImplementation(async () => ({ affected: 1 }) as DeleteResult);

    const result = await deletePostUseCase.execute({
      deletePostDTO: {
        blogId,
        postId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isPostFound: true,
      isPostDeleted: true,
    });
  });

  it("Should return 404 error is post not found ", async () => {
    const blogId = uuidv4();
    const postId = uuidv4();

    jest
      .spyOn(blogsRepo, "findBlogById")
      .mockImplementation(async () => blogId);
    jest
      .spyOn(postsRepo, "findPostById")
      .mockImplementation(async () => null);

    const result = await deletePostUseCase.execute({
      deletePostDTO: {
        blogId,
        postId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isPostFound: false,
      isPostDeleted: false,
    });
  });

  it("Should return 404 blog not found ", async () => {
    const blogId = uuidv4();
    const postId = uuidv4();

    jest
      .spyOn(blogsRepo, "findBlogById")
      .mockImplementation(async () => null);
    jest
      .spyOn(postsRepo, "findPostById")
      .mockImplementation(async () => null);

    const result = await deletePostUseCase.execute({
      deletePostDTO: {
        blogId,
        postId,
      },
    });

    expect(result).toEqual({
      isBlogFound: false,
      isPostFound: false,
      isPostDeleted: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
