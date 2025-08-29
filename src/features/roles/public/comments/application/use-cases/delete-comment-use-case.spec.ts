import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { DeleteCommentUseCase } from "./delete-comment-use-case";
import { v4 as uuidv4 } from "uuid";
import { CommentsRepo } from "../../../../../infrstructura/comments/comments.adapter";
import { Comment } from "../../../../../entity/comments-entity";
import { DeleteResult } from "typeorm";

describe("DeleteCommentUseCase", () => {
  let app: TestingModule;
  let commentsRepo: CommentsRepo;
  let deleteCommentUseCase: DeleteCommentUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    commentsRepo = app.get<CommentsRepo>(CommentsRepo);
    deleteCommentUseCase = app.get<DeleteCommentUseCase>(DeleteCommentUseCase);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(commentsRepo).toBeDefined();
    expect(deleteCommentUseCase).toBeDefined();
  });

  it("Should delete comment", async () => {
    const userId = uuidv4();

    jest
      .spyOn(commentsRepo, "findCommentById")
      .mockImplementation(async () => ({ userId }) as Comment);

    jest
      .spyOn(commentsRepo, "deleteComment")
      .mockImplementation(async () => ({ affected: 1 }) as DeleteResult);

    jest
      .spyOn(commentsRepo, "isAnyCommentLikesData")
      .mockImplementation(async () => null);

    const result = await deleteCommentUseCase.execute({
      deleteCommentDTO: {
        commentId: "",
        userId,
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isCommentDeleted: true,
      isForbidden: false,
    });
  });
  it("Should return 403 error", async () => {
    jest
      .spyOn(commentsRepo, "findCommentById")
      .mockImplementation(
        async () => ({ userId: uuidv4() }) as Comment
      );

    const result = await deleteCommentUseCase.execute({
      deleteCommentDTO: {
        commentId: "",
        userId: uuidv4(),
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isCommentDeleted: false,
      isForbidden: true,
    });
  });
  it("Should return 404 error", async () => {
    jest
      .spyOn(commentsRepo, "findCommentById")
      .mockImplementation(async () => null);

    const result = await deleteCommentUseCase.execute({
      deleteCommentDTO: {
        commentId: "",
        userId: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: false,
      isCommentDeleted: false,
      isForbidden: false,
    });
  });
});
