import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import type { FindProductDto } from "./dto/find-product.dto";
import type { ProductModel } from "./product.model";

@Controller("product")
export class ProductController {
  @Get(":id")
  async get(@Param("id") _id: string) {}

  @Post("create")
  async create(@Body() _dto: Omit<ProductModel, "_id">) {}

  @Delete(":id")
  async delete(@Param("id") _id: string) {}

  @Patch(":id")
  async update(@Param("id") _id: string, @Body() _dto: ProductModel) {}

  @HttpCode(200)
  @Post("find")
  async find(@Query() _dto: FindProductDto) {}
}
