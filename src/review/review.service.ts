import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewModel } from "./review.model";

@Injectable()
export class ReviewService {
  constructor(@InjectModel(ReviewModel.name) private reviewModel: Model<ReviewModel>) {}

  async create(createReviewDto: CreateReviewDto) {
    const review = new this.reviewModel(createReviewDto);
    return review.save();
  }

  async delete(id: string) {
    return this.reviewModel.findByIdAndDelete(id).exec();
  }

  async findByProductId(productId: string) {
    return this.reviewModel.find({ productId: new Types.ObjectId(productId) }).exec();
  }

  async deleteAllByProductId(productId: string) {
    return this.reviewModel.deleteMany({ productId: new Types.ObjectId(productId) }).exec();
  }
}
