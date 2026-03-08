import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import type { FindTopPageDto } from "./dto/find-top-page.dto";
import type { TopPageModel } from "./top-page.model";

@Controller("top-page")
export class TopPageController {
  @Get("get/:alias")
  async get(@Param("alias") _alias: string) {}

  @Post("create")
  async create(@Body() _dto: Omit<TopPageModel, "_id">) {}

  @Delete(":id")
  async delete(@Param("id") _id: string) {}

  @Patch(":id")
  async update(@Param("id") _id: string, @Body() _dto: TopPageModel) {}

  @HttpCode(200)
  @Post("find")
  async find(@Body() _dto: FindTopPageDto) {}
}
