import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HandlePostCommentDTO, HandlePostLikeResult } from "../posts.dto";
import { PostsRepo } from "../../../../../infrstructura/posts/posts.adapter";
import { PostLike } from "../../../../../entity/post-likes-entity";

export class HandlePostLikesCommand {
  constructor(public likePostDto: HandlePostCommentDTO) {}
}

@CommandHandler(HandlePostLikesCommand)
export class LikeStatusPostUseCase
  implements ICommandHandler<HandlePostLikesCommand>
{
  constructor(private postsRepo: PostsRepo) {}

  async execute(command: HandlePostLikesCommand) {
    const { postId, userId, postLikeStatus, userLogin } = command.likePostDto;

    const result: HandlePostLikeResult = {
      isPostFound: false,
      isLikeStatusUpdated: false,
      isLikeStatusCreated: false,
    };

    // if no post return not found
    const postData = await this.postsRepo.findPostById(postId);
    if (!postData) {
      return result;
    }
    result.isPostFound = true;

    // check comment like entity, do we have it for current user ?
    const postLikeEntity = await this.postsRepo.findPostLikeData({
      userId,
      postId,
    });

    // if we don't have for current user, any comment like entity, create it
    if (!postLikeEntity) {
      try {
        const postLike = new PostLike();
        postLike.postId = postId;
        postLike.userId = userId;
        postLike.likeStatus = postLikeStatus;
        postLike.userLogin = userLogin;
        postLike.createdAt = new Date();
        await this.postsRepo.savePostLike(postLike);

        result.isLikeStatusCreated = true;
      } catch (err) {
        throw new Error(`Something went product with post like handle ${err}`);
      }
    } else {
      try {
        // if we have for current user post like entity, just update like status
        postLikeEntity.likeStatus = postLikeStatus;
        await this.postsRepo.savePostLike(postLikeEntity);

        result.isLikeStatusUpdated = true;
      } catch (err) {
        throw new Error(`Something went product with like handle ${err}`);
      }
    }

    return result;
  }
}
