import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../../app.module";
import { v4 as uuidv4 } from "uuid";
import { UpdatePostBySAUseCase } from "./sa.update-post.use-case";
import { BlogsRepo } from "../../../../../../infrstructura/blogs/blogs.adapter";
import { PostsRepo } from "../../../../../../infrstructura/posts/posts.adapter";
import { Post } from "../../../../../../entity/posts-entity";

describe("Update post use case", () => {
  let app: TestingModule;
  let updatePostUseCase: UpdatePostBySAUseCase;
  let blogsRepo: BlogsRepo;
  let postsRepo: PostsRepo;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    updatePostUseCase = app.get<UpdatePostBySAUseCase>(UpdatePostBySAUseCase);
    blogsRepo = app.get<BlogsRepo>(BlogsRepo);
    postsRepo = app.get<PostsRepo>(PostsRepo);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(updatePostUseCase).toBeDefined();
    expect(blogsRepo).toBeDefined();
    expect(postsRepo).toBeDefined();
  });

  it("Should update post succesfully ", async () => {
    const blogId = uuidv4();
    const postId = uuidv4();

    jest
      .spyOn(blogsRepo, "findBlogById")
      .mockImplementation(async () => blogId);
    jest
      .spyOn(postsRepo, "findPostById")
      .mockImplementation(async () => ({ id: postId }) as Post);

    jest
      .spyOn(postsRepo, "savePost")
      .mockImplementation(async () => ({}) as Post);

    const result = await updatePostUseCase.execute({
      updatePostDTO: {
        title: "updated title",
        shortDescription: "updated shortDescription",
        content: "updated content",
        blogId,
        postId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isPostFound: true,
      isPostUpdated: true,
    });
  });
  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
