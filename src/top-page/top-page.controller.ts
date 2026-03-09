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
import { IdValidationPipe } from "src/pipes/id-validation.pipe";
import { CreateTopPageDto } from "./dto/create-top-page.dto";
import { FindTopPageDto } from "./dto/find-top-page.dto";
import { UpdateTopPageDto } from "./dto/update-top-page.dto";
import { TOP_PAGE_CONSTANTS } from "./top-page.constants";
import { TopPageService } from "./top-page.service";

@Controller("top-page")
export class TopPageController {
  constructor(private readonly topPageService: TopPageService) {}

  @Get(":id")
  async getById(@Param("id", IdValidationPipe) id: string) {
    const topPage = await this.topPageService.getById(id);

    if (!topPage) {
      throw new NotFoundException(TOP_PAGE_CONSTANTS.NOT_FOUND);
    }

    return topPage;
  }

  @Get("getByAlias/:alias")
  async get(@Param("alias") alias: string) {
    return this.topPageService.getByAlias(alias);
  }

  @Post("create")
  async create(@Body() dto: CreateTopPageDto) {
    const createdTopPage = await this.topPageService.create(dto);

    if (!createdTopPage) {
      throw new BadRequestException(TOP_PAGE_CONSTANTS.CREATION_FAILED);
    }

    return createdTopPage;
  }

  @Delete(":id")
  async delete(@Param("id", IdValidationPipe) id: string) {
    const deletedTopPage = await this.topPageService.delete(id);

    if (!deletedTopPage) {
      throw new NotFoundException(TOP_PAGE_CONSTANTS.DELETION_FAILED);
    }

    return {
      id: deletedTopPage._id,
      message: TOP_PAGE_CONSTANTS.DELETION_SUCCESS,
    };
  }

  @Patch(":id")
  async update(@Param("id", IdValidationPipe) id: string, @Body() dto: UpdateTopPageDto) {
    const updatedTopPage = await this.topPageService.update(id, dto);

    if (!updatedTopPage) {
      throw new NotFoundException(TOP_PAGE_CONSTANTS.UPDATE_FAILED);
    }

    return updatedTopPage;
  }

  @HttpCode(200)
  @Post("find")
  async find(@Body() dto: FindTopPageDto) {
    const foundTopPages = await this.topPageService.find(dto);

    if (!foundTopPages) {
      throw new NotFoundException(TOP_PAGE_CONSTANTS.NOT_FOUND);
    }

    return foundTopPages;
  }

  @HttpCode(200)
  @Post("findByText")
  async textSearch(@Query("text") text: string) {
    return this.topPageService.findByText(text);
  }

  @HttpCode(200)
  @Post("findByCategory")
  async findByCategory(@Body() dto: FindTopPageDto) {
    return this.topPageService.findByFirstCategory(dto);
  }
}
