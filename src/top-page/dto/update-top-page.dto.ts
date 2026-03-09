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
  @IsOptional()
  @IsNumber()
  count?: number;

  @IsOptional()
  @IsNumber()
  juniorSalary?: number;

  @IsOptional()
  @IsNumber()
  seniorSalary?: number;
}

export class TopPageAdvantage {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTopPageDto {
  @IsOptional()
  @IsEnum(TopLevelCategory)
  firstCategory?: TopLevelCategory;

  @IsOptional()
  @IsString()
  secondCategory?: string;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;

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

  @IsOptional()
  @IsString()
  tagsTitle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
