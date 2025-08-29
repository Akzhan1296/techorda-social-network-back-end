import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { v4 as uuidv4 } from "uuid";
import { UpdateCommentUseCase } from "./update-comment-use-case";
import { CommentsRepo } from "../../../../../infrstructura/comments/comments.adapter";
import { Comment } from "../../../../../entity/comments-entity";

describe("UpdateCommentUseCase", () => {
  let app: TestingModule;
  let commentsRepo: CommentsRepo;
  let updateCommentUseCase: UpdateCommentUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    commentsRepo = app.get<CommentsRepo>(CommentsRepo);
    updateCommentUseCase = app.get<UpdateCommentUseCase>(UpdateCommentUseCase);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(commentsRepo).toBeDefined();
    expect(updateCommentUseCase).toBeDefined();
  });

  it("Should update comment", async () => {
    const userId = uuidv4();

    jest
      .spyOn(commentsRepo, "findCommentById")
      .mockImplementation(async () => ({ userId }) as Comment);

    jest
      .spyOn(commentsRepo, "saveComment")
      .mockImplementation(async () => ({}) as Comment);

    const result = await updateCommentUseCase.execute({
      updateCommentDTO: {
        commentId: "",
        userId,
        content: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isCommentUpdated: true,
      isForbidden: false,
    });
  });
  it("Should return 403 error", async () => {
    jest
      .spyOn(commentsRepo, "findCommentById")
      .mockImplementation(
        async () => ({ userId: uuidv4() }) as Comment
      );

    const result = await updateCommentUseCase.execute({
      updateCommentDTO: {
        commentId: "",
        userId: uuidv4(),
        content: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isCommentUpdated: false,
      isForbidden: true,
    });
  });
  it("Should return 404 error", async () => {
    jest
      .spyOn(commentsRepo, "findCommentById")
      .mockImplementation(async () => null);

    const result = await updateCommentUseCase.execute({
      updateCommentDTO: {
        commentId: "",
        userId: "",
        content: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: false,
      isCommentUpdated: false,
      isForbidden: false,
    });
  });
});
