import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { ProductModel } from "src/product/product.model";

export type ReviewDocument = HydratedDocument<ReviewModel>;

@Schema({ collection: "Review", timestamps: true })
export class ReviewModel {
  @Prop()
  name: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  rating: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ProductModel.name, index: true })
  productId: Types.ObjectId;
}

export const ReviewSchema = SchemaFactory.createForClass(ReviewModel);
