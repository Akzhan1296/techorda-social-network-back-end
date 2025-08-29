import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { HttpExceptionFilter } from "../src/exception.filter";
import { useContainer } from "class-validator";
import cookieParser from "cookie-parser";

export const initTestApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(cookieParser());
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorsForProperty: any[] = [];

        errors.forEach((e) => {
          const constrainKey = Object.keys(e.constraints!);
          constrainKey.forEach((cKey) => {
            errorsForProperty.push({
              field: e.property,
              message: e.constraints![cKey],
            });
          });
        });

        throw new BadRequestException(errorsForProperty);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  return app;
};
