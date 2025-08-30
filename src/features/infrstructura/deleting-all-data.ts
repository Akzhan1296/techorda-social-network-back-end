import {
  Controller,
  Delete,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Request, Response } from "express";

export class DeleteAllTestingData {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteRegistrationTableData() {
    await this.dataSource.query(`DELETE FROM public."registration"`);
  }
  async deleteAuthSessionTableData() {
    await this.dataSource.query(`DELETE FROM public."auth_session"`);
  }
  async deleteUserTableData() {
    await this.dataSource.query(`DELETE FROM public."user"`);
  }

  async deleteIpsTableData() {
    await this.dataSource.query(`DELETE FROM public."ips"`);
  }

  async deleteCommentsTableData() {
    await this.dataSource.query(`DELETE FROM public."comment"`);
  }
  
  async deleteCommentLikesTableData() {
    await this.dataSource.query(`DELETE FROM public."comment_like"`);
  }
  
  async deletePostsLikesTableData() {
    await this.dataSource.query(`DELETE FROM public."post_like"`);
  }

  async deletePostsTableData() {
    await this.dataSource.query(`DELETE FROM public."post"`);
  }

  async deleteBlogsTableData() {
    await this.dataSource.query(`DELETE FROM public."blog"`);
  }

  async addUserIdColumnToBlog() {
    try {
      // Проверяем, существует ли колонка
      const result = await this.dataSource.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='blog' AND column_name='userId'
      `);
      
      if (result.length === 0) {
        // Добавляем колонку, если она не существует
        await this.dataSource.query(`
          ALTER TABLE public."blog" 
          ADD COLUMN "userId" character varying
        `);
        console.log('Successfully added userId column to blog table');
      } else {
        console.log('userId column already exists in blog table');
      }
    } catch (error) {
      console.error('Error adding userId column:', error);
      throw error;
    }
  }
}

@Controller("testing")
export class DeleteDataController {
  constructor(private readonly deleteRepository: DeleteAllTestingData) {}

  @Delete("/all-data")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTestData(@Req() request: Request, @Res() response: Response) {
    await this.deleteRepository.deleteIpsTableData();

    await this.deleteRepository.deleteCommentLikesTableData();
    await this.deleteRepository.deleteCommentsTableData();
    await this.deleteRepository.deletePostsLikesTableData();
    await this.deleteRepository.deletePostsTableData();
    await this.deleteRepository.deleteBlogsTableData();
    await this.deleteRepository.deleteRegistrationTableData();
    await this.deleteRepository.deleteAuthSessionTableData();
    await this.deleteRepository.deleteUserTableData();

    return response.status(HttpStatus.NO_CONTENT).send();
  }

  @Post("/migrate-blog-userId")
  @HttpCode(HttpStatus.OK)
  async migrateBlogUserId(@Req() request: Request, @Res() response: Response) {
    try {
      await this.deleteRepository.addUserIdColumnToBlog();
      return response.status(HttpStatus.OK).json({ message: "Migration completed successfully" });
    } catch (error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
