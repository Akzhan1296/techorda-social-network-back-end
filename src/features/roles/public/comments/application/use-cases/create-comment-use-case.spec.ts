import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { CreateCommentUseCase } from "./create-comment-use-case";
import { v4 as uuidv4 } from "uuid";
import { CommentsRepo } from "../../../../../infrstructura/comments/comments.adapter";
import { PostsRepo } from "../../../../../infrstructura/posts/posts.adapter";
import { Comment } from "../../../../../entity/comments-entity";
import { Post } from "../../../../../entity/posts-entity";


describe("CreateCommentUseCase", () => {
  let app: TestingModule;
  let postsRepo: PostsRepo;
  let commentsRepo: CommentsRepo;
  let createCommentUseCase: CreateCommentUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    postsRepo = app.get<PostsRepo>(PostsRepo);
    commentsRepo = app.get<CommentsRepo>(CommentsRepo);
    createCommentUseCase = app.get<CreateCommentUseCase>(CreateCommentUseCase);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(postsRepo).toBeDefined();
    expect(commentsRepo).toBeDefined();
    expect(createCommentUseCase).toBeDefined();
  });

  it("Should create comment succesfully", async () => {
    const commentId = uuidv4();

    jest
      .spyOn(postsRepo, "findPostById")
      .mockImplementation(async () => ({}) as Post);

    jest
      .spyOn(commentsRepo, "saveComment")
      .mockImplementation(async () => ({ id: commentId }) as Comment);

    const result = await createCommentUseCase.execute({
      createCommentDTO: {
        userLogin: "",
        userId: "",
        postId: "",
        content: "",
      },
    });

    expect(result).toEqual({
      isPostFound: true,
      isCommentCreated: true,
      commentId,
    });
  });

  it("Should NOT create comment, if post did NOT found", async () => {
    jest.spyOn(postsRepo, "findPostById").mockImplementation(async () => null);

    const result = await createCommentUseCase.execute({
      createCommentDTO: {
        userLogin: "",
        userId: "",
        postId: "",
        content: "",
      },
    });

    expect(result).toEqual({
      isPostFound: false,
      isCommentCreated: false,
      commentId: null,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
