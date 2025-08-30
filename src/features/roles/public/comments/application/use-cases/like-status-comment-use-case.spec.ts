import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { LikeStatusCommentUseCase } from "./like-status-comment-use-case";
import { CommentsRepo } from "../../../../../infrstructura/comments/comments.adapter";
import { Comment } from "../../../../../entity/comments-entity";
import { CommentLike } from "../../../../../entity/comment-likes-entity";

describe("LikeStatusCommentUseCase", () => {
  let app: TestingModule;
  let commentsRepo: CommentsRepo;
  let likeStatusCommentuseCase: LikeStatusCommentUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();
    commentsRepo = app.get<CommentsRepo>(CommentsRepo);
    likeStatusCommentuseCase = app.get<LikeStatusCommentUseCase>(
      LikeStatusCommentUseCase
    );
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(commentsRepo).toBeDefined();
    expect(likeStatusCommentuseCase).toBeDefined();
  });

  it("Should NOT create comment like entity, if comment not found", async () => {
    jest
      .spyOn(commentsRepo, "findCommentById")
      .mockImplementation(async () => null);

    const result = await likeStatusCommentuseCase.execute({
      likeCommentDto: {
        commentId: "",
        commentLikeStatus: "Like",
        userId: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: false,
      isLikeStatusUpdated: false,
      isLikeStatusCreated: false,
    });
  });

  it("Should CREATE comment like entity, if comment found and comment entity NOT found", async () => {
    jest
      .spyOn(commentsRepo, "findCommentById")
      .mockImplementation(async () => ({}) as Comment);

    jest
      .spyOn(commentsRepo, "findCommentLikeData")
      .mockImplementation(async () => null);

    jest
      .spyOn(commentsRepo, "saveCommentLike")
      .mockImplementation(async () => ({}) as CommentLike);

    const result = await likeStatusCommentuseCase.execute({
      likeCommentDto: {
        commentId: "",
        commentLikeStatus: "Like",
        userId: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isLikeStatusUpdated: false,
      isLikeStatusCreated: true,
    });
  });

  it("Should UPDATE comment like entity, if comment found and comment entity found", async () => {
    jest
      .spyOn(commentsRepo, "findCommentById")
      .mockImplementation(async () => ({}) as Comment);

    jest
      .spyOn(commentsRepo, "findCommentLikeData")
      .mockImplementation(async () => ({}) as CommentLike);

    jest
      .spyOn(commentsRepo, "saveCommentLike")
      .mockImplementation(async () =>  ({}) as CommentLike);

    const result = await likeStatusCommentuseCase.execute({
      likeCommentDto: {
        commentId: "",
        commentLikeStatus: "Like",
        userId: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isLikeStatusUpdated: true,
      isLikeStatusCreated: false,
    });
  });
});
