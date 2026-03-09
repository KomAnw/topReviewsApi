import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { TopLevelCategory } from "../top-page.model";

export class HhData {
  @IsNumber()
  count: number;
  @IsNumber()
  juniorSalary: number;
  @IsNumber()
  seniorSalary: number;
}

export class TopPageAdvantage {
  @IsString()
  title: string;
  @IsString()
  description: string;
}

export class CreateTopPageDto {
  @IsEnum(TopLevelCategory)
  firstCategory: TopLevelCategory;

  @IsString()
  secondCategory: string;

  @IsString()
  alias: string;

  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsObject()
  hh?: HhData;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopPageAdvantage)
  advantages?: TopPageAdvantage[];

  @IsOptional()
  @IsString()
  seoText?: string;

  @IsString()
  tagsTitle: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
