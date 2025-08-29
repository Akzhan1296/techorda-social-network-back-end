import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "../../entity/posts-entity";
import { PostLike } from "../../entity/post-likes-entity";

@Injectable()
export class PostsRepo {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>
  ) {}

  async findPostLikeData({
    userId,
    postId,
  }: {
    userId: string;
    postId: string;
  }) {
    return await this.postLikeRepository.findOne({
      where: { userId, postId },
    });
  }

  async findPostById(postId: string): Promise<Post | null> {
    return this.postsRepository.findOneBy({ id: postId });
  }

  async isAnyPostLikesData(postId: string) {
    return this.postLikeRepository.find({ where: { postId } });
  }

  async savePost(post: Post): Promise<Post> {
    return this.postsRepository.save(post);
  }

  async deletePost(post: Post) {
    return this.postsRepository.delete(post);
  }

  async savePostLike(postLike: PostLike) {
    return this.postLikeRepository.save(postLike);
  }

  async deletePostLikeEntities(postId: string) {
    return this.postLikeRepository.delete({ postId });
  }
}
