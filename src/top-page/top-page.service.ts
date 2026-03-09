import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateTopPageDto } from "./dto/create-top-page.dto";
import { FindTopPageDto } from "./dto/find-top-page.dto";
import { UpdateTopPageDto } from "./dto/update-top-page.dto";
import { TopPageModel } from "./top-page.model";

@Injectable()
export class TopPageService {
  constructor(@InjectModel(TopPageModel.name) private topPageModel: Model<TopPageModel>) {}

  async getById(id: string) {
    return this.topPageModel.findById(id).exec();
  }

  async getByAlias(alias: string) {
    return this.topPageModel.findOne({ alias }).exec();
  }

  async create(dto: CreateTopPageDto) {
    return this.topPageModel.create(dto);
  }

  async update(id: string, dto: UpdateTopPageDto) {
    return this.topPageModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async delete(id: string) {
    return this.topPageModel.findByIdAndDelete(id).exec();
  }

  async find(dto: FindTopPageDto) {
    return this.topPageModel.find(dto).exec();
  }

  async findByFirstCategory(dto: FindTopPageDto) {
    return this.topPageModel
      .find(dto, {
        alias: 1,
        secondCategory: 1,
        title: 1,
        category: 1,
      })
      .exec();
  }

  async findByCategory(dto: FindTopPageDto) {
    return this.topPageModel
      .aggregate()
      .match({ firstCategory: dto.firstCategory })
      .group({ pages: { $push: { alias: "$alias", title: "$title" } } })
      .exec();
  }

  async findByText(text: string) {
    return this.topPageModel.find({ $text: { $search: text, $caseSensitive: false } }).exec();
  }
}
