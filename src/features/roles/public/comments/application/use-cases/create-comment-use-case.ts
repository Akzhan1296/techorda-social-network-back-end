import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCommentDTO, CreateCommentResult } from "../comments.dto";
import { PostsRepo } from "../../../../../infrstructura/posts/posts.adapter";
import { Comment } from "../../../../../entity/comments-entity";
import { CommentsRepo } from "../../../../../infrstructura/comments/comments.adapter";

export class CreateCommentCommand {
  constructor(public createCommentDTO: CreateCommentDTO) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private postsRepo: PostsRepo,
    private commentsRepo: CommentsRepo
  ) {}

  async execute(command: CreateCommentCommand): Promise<CreateCommentResult> {
    const result: CreateCommentResult = {
      isPostFound: false,
      isCommentCreated: false,
      commentId: null,
    };

    const { userLogin, userId, content, postId } = command.createCommentDTO;

    const postData = await this.postsRepo.findPostById(postId);

    if (!postData) return result;
    result.isPostFound = true;

    const newComment = new Comment();
    newComment.createdAt = new Date();
    newComment.userLogin = userLogin;
    newComment.userId = userId;
    newComment.content = content;
    newComment.postId = postId;

    try {
      const savedComment = await this.commentsRepo.saveComment(newComment);
      result.isCommentCreated = true;
      result.commentId = savedComment.id;
    } catch (err) {
      throw new Error(`Something went wrong on comment creating ${err}`);
    }

    return result;
  }
}
