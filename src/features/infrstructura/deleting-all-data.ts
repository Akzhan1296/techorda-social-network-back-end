import {
  Controller,
  Delete,
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
}
