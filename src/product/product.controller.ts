import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { UpdateProductDto } from "./dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { FindProductDto } from "./dto/find-product.dto";
import { PRODUCT_CONSTANTS } from "./product.constants";
import { ProductService } from "./product.service";

@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Get(":id")
  async get(@Param("id") id: string) {
    const product = await this.productService.findById(id);

    if (!product) {
      throw new NotFoundException(PRODUCT_CONSTANTS.NOT_FOUND_BY_ID);
    }

    return product;
  }

  @Post("create")
  async create(@Body() dto: CreateProductDto) {
    const createdProduct = await this.productService.create(dto);

    if (!createdProduct) {
      throw new BadRequestException(PRODUCT_CONSTANTS.CREATION_FAILED);
    }

    return createdProduct;
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    const deletedProduct = await this.productService.deleteById(id);

    if (!deletedProduct) {
      throw new NotFoundException(PRODUCT_CONSTANTS.DELETION_FAILED);
    }

    return {
      id: deletedProduct._id,
      message: PRODUCT_CONSTANTS.DELETION_SUCCESS,
    };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    const updatedProduct = await this.productService.updateById(id, dto);

    if (!updatedProduct) {
      throw new NotFoundException(PRODUCT_CONSTANTS.UPDATE_FAILED);
    }

    return updatedProduct;
  }

  @HttpCode(200)
  @Post("find")
  async find(@Query() dto: FindProductDto) {
    return this.productService.findWithReviews(dto);
  }
}
