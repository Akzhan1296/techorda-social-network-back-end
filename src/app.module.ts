import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from "@nestjs/cqrs";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./config";

//controllers
import { AppController } from "./app.controller";
import { AuthController } from "./features/roles/public/auth/api/auth.controller";
import { UsersController } from "./features/roles/sa/users/api/sa.users.controller";
import { DevicesController } from "./features/roles/public/devices/api/device.controller";
import { SABlogsController } from "./features/roles/sa/blogs/api/sa.blogs.controller";
import { PublicPostsController } from "./features/roles/public/posts/api/public-posts.controller";
import { PublicBlogsController } from "./features/roles/public/blogs/api/public-blogs.controller";
import { PublicCommentsController } from "./features/roles/public/comments/api/public-comments.controller";

//service
import { AppService } from "./app.service";
import { AuthService } from "./features/roles/public/auth/application/auth.service";
import { JwtService } from "@nestjs/jwt";

//repository
import {
  DeleteAllTestingData,
  DeleteDataController,
} from "./features/infrstructura/deleting-all-data";

//useCases
import { RegistrationUserUseCase } from "./features/roles/public/auth/application/use-cases/registration-user-use-case";
import { CreateUserUseCase } from "./features/roles/sa/users/application/use-cases/create-user-use-case";
import { RegistrationConfirmationUseCase } from "./features/roles/public/auth/application/use-cases/registration-confirmation-use-case";
import { EmailResendingUseCase } from "./features/roles/public/auth/application/use-cases/registration-email-resendings-use-case";
import { DeleteUserUseCase } from "./features/roles/sa/users/application/use-cases/delete-user-use-case";
import { LoginUseCase } from "./features/roles/public/auth/application/use-cases/login-use-case";
import { UpdateUserRefreshTokenUseCase } from "./features/roles/public/auth/application/use-cases/refresh-token-use-case";
import { LogOutUseCase } from "./features/roles/public/auth/application/use-cases/logout-use-case";
import { PasswordRecoveryUseCase } from "./features/roles/public/auth/application/use-cases/password-recovery-use-case";
import { NewPasswordUseCase } from "./features/roles/public/auth/application/use-cases/new-password-use-case";
import { DeleteCurrentDeviceUseCase } from "./features/roles/public/devices/application/use-cases/delete-current-device-use-case";
import { DeleteDevicesExceptCurrentUseCase } from "./features/roles/public/devices/application/use-cases/delete-all-devices-use-case";
import { CreateBlogBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/sa.create-blog.use-case";
import { DeleteBlogBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/sa.delete-blog.use-case";
import { UpdateBlogBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/sa.update-blog.use-case";
import { CreatePostBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/posts/sa.create-post.use-case";
import { DeletePostBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/posts/sa.delete-post.use-case";
import { UpdatePostBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/posts/sa.update-post.use-case";
import { CreateCommentUseCase } from "./features/roles/public/comments/application/use-cases/create-comment-use-case";
import { LikeStatusCommentUseCase } from "./features/roles/public/comments/application/use-cases/like-status-comment-use-case";
import { DeleteCommentUseCase } from "./features/roles/public/comments/application/use-cases/delete-comment-use-case";
import { UpdateCommentUseCase } from "./features/roles/public/comments/application/use-cases/update-comment-use-case";
import { LikeStatusPostUseCase } from "./features/roles/public/posts/application/use-cases/handle-post-like-use-case";

// entity
import { User } from "./features/entity/users-entity";
import { Registration } from "./features/entity/registration-entity";
import { AuthSession } from "./features/entity/auth-session-entity";
import { Post } from "./features/entity/posts-entity";
import { Comment } from "./features/entity/comments-entity";
import { Blog } from "./features/entity/blogs-entity";
import { CommentLike } from "./features/entity/comment-likes-entity";
import { PostLike } from "./features/entity/post-likes-entity";

// repository
import { BlogsRepo } from "./features/infrstructura/blogs/blogs.adapter";
import { BlogsQueryRepo } from "./features/infrstructura/blogs/blogs.query.adapter";
import { UsersRepo } from "./features/infrstructura/users/users.adapter";
import { UsersQueryRepo } from "./features/infrstructura/users/users.query.adapter";
import { DeviceSessionRepo } from "./features/infrstructura/deviceSessions/device-sessions.adapter";
import { DeviceSessionQueryRepo } from "./features/infrstructura/deviceSessions/device-sessions.query.adapter";
import { PostsRepo } from "./features/infrstructura/posts/posts.adapter";
import { PostsQueryRepo } from "./features/infrstructura/posts/posts.query.adapter";
import { CommentsRepo } from "./features/infrstructura/comments/comments.adapter";
import { CommentsQueryRepo } from "./features/infrstructura/comments/comments.query.adapter";

const userUseCases = [CreateUserUseCase, DeleteUserUseCase];
const authUseCases = [
  RegistrationUserUseCase,
  RegistrationConfirmationUseCase,
  EmailResendingUseCase,
  LoginUseCase,
  UpdateUserRefreshTokenUseCase,
  LogOutUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
];
const deviceUseCases = [
  DeleteCurrentDeviceUseCase,
  DeleteDevicesExceptCurrentUseCase,
];
const saBlogsUseCases = [
  CreateBlogBySAUseCase,
  DeleteBlogBySAUseCase,
  UpdateBlogBySAUseCase,
];
const saPostsUseCases = [
  CreatePostBySAUseCase,
  DeletePostBySAUseCase,
  UpdatePostBySAUseCase,
];
const publicPostsUseCases = [LikeStatusPostUseCase];
const commentsUseCases = [
  CreateCommentUseCase,
  LikeStatusCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
];

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const env = process.env.ENV;
        console.log(env)
        if (env === "TYPEORM") {
          console.log(configService.get("typeorm2"));
          return configService.get("typeorm2");
        }

        if (env === "TESTING") {
          console.log(configService.get("localDB"));
          return configService.get("localDB");
        }

        if (env === "DEV") {
          console.log(555)
          console.log(configService.get("remoteDB"));
          return configService.get("remoteDB");
        }
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Registration,
      AuthSession,
      Post,
      Comment,
      Blog,
      CommentLike,
      PostLike,
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    DevicesController,
    DeleteDataController,
    SABlogsController,
    PublicBlogsController,
    PublicPostsController,
    PublicCommentsController,
  ],
  providers: [
    JwtService,
    AppService,
    AuthService,
    DeleteAllTestingData,
    BlogsRepo,
    BlogsQueryRepo,
    UsersRepo,
    UsersQueryRepo,
    DeviceSessionRepo,
    DeviceSessionQueryRepo,
    PostsRepo,
    PostsQueryRepo,
    CommentsRepo,
    CommentsQueryRepo,
    ...userUseCases,
    ...authUseCases,
    ...deviceUseCases,
    ...saBlogsUseCases,
    ...saPostsUseCases,
    ...commentsUseCases,
    ...publicPostsUseCases,
  ],
})
export class AppModule {}
