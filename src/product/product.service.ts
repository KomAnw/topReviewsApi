import { Injectable, Param } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IdValidationPipe } from "src/pipes/id-validation.pipe";
import { ReviewModel } from "src/review/review.model";
import { reviewsSorting } from "src/utils/reviews-sort.util";
import { CreateProductDto, FindProductDto, UpdateProductDto } from "./dto";
import { ProductModel } from "./product.model";

@Injectable()
export class ProductService {
  constructor(@InjectModel(ProductModel.name) private productModel: Model<ProductModel>) {}

  async create(dto: CreateProductDto) {
    return this.productModel.create(dto);
  }

  async findById(@Param("id", IdValidationPipe) id: string) {
    return this.productModel.findById(id).exec();
  }

  async updateById(@Param("id", IdValidationPipe) id: string, dto: UpdateProductDto) {
    return this.productModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async deleteById(@Param("id", IdValidationPipe) id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }

  async findWithReviews(dto: FindProductDto) {
    return this.productModel
      .aggregate()
      .match({ categories: dto.category })
      .sort({ _id: 1 })
      .limit(dto.limit ?? 0)
      .lookup({
        from: "Review",
        localField: "_id",
        foreignField: "productId",
        as: "reviews",
      })
      .addFields({
        reviewsCount: { $size: "$reviews" },
        reviewsAvgRating: { $avg: "$reviews.rating" },
        reviews: {
          $function: {
            body: reviewsSorting.toString(),
            args: ["$reviews"],
            lang: "js",
          },
        },
      })
      .exec() as Promise<
      (ProductModel & {
        reviews: ReviewModel[];
        reviewsCount: number;
        reviewsAvgRating: number;
      })[]
    >;
  }
}
