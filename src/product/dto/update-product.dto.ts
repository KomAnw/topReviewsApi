import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class ProductCharacteristics {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  value?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  oldPrice?: number;

  @IsOptional()
  @IsNumber()
  credit?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  advantages?: string;

  @IsOptional()
  @IsString()
  disadvantages?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductCharacteristics)
  characteristics?: ProductCharacteristics[];
}
