import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      const errorResponse = {
        errorsMessages: [],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseBody: any = exception.getResponse();
      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((m) => {
          errorResponse.errorsMessages.push(m);
        });
      } else {
        errorResponse.errorsMessages.push(responseBody);
      }

      response.status(status).json(errorResponse);
      return;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
