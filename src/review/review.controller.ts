import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { CreateReviewDto } from "./dto/create-review.dto";
import { REVIEW_CONSTANTS } from "./review.constants";
import { ReviewService } from "./review.service";

@Controller("review")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post("create")
  async create(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    const deletedReview = await this.reviewService.delete(id);

    if (!deletedReview) {
      throw new NotFoundException(REVIEW_CONSTANTS.NOT_FOUND_BY_ID);
    }

    return deletedReview;
  }

  @Delete("deleteAllByProductId/:id")
  async deleteAllByProductId(@Param("id") id: string) {
    const deletedReviews = await this.reviewService.deleteAllByProductId(id);

    if (!deletedReviews) {
      throw new NotFoundException(REVIEW_CONSTANTS.NOT_FOUND_BY_PRODUCT_ID);
    }

    return deletedReviews;
  }

  @UseGuards(JwtGuard)
  @Get("byProduct/:id")
  async getByProductId(@Param("id") id: string) {
    return this.reviewService.findByProductId(id);
  }
}
