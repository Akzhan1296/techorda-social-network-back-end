import { NestFactory } from "@nestjs/core";
import { useContainer } from "class-validator";
import cookieParser from "cookie-parser";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./exception.filter";
import cors from "cors"
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(
    cors({
      origin: "https://techorda-social-network-front-end.vercel.app/",
      
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const errorsForProperty = [];

        errors.forEach((e) => {
          const constrainKey = Object.keys(e.constraints);
          constrainKey.forEach((cKey) => {
            errorsForProperty.push({
              field: e.property,
              message: e.constraints[cKey],
            });
          });
        });

        throw new BadRequestException(errorsForProperty);
      },
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(PORT, () => {
    console.log("app started");
  });
}
bootstrap();
