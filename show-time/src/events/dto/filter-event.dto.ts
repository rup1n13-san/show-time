import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

const cleanNumericValue = (value: any): number | undefined => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const num = Number(value);

  // If it's NaN, 0, or negative, return undefined
  if (isNaN(num) || num <= 0) {
    return undefined;
  }

  return num;
};

const cleanValue = (value: any): any => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortBy {
  TITLE = 'title',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  PRICE = 'price',
}

export class FilterEventDto {
  @IsOptional()
  @Transform(({ value }) => cleanValue(value))
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => cleanValue(value))
  @IsString()
  typeEvent?: string;

  @IsOptional()
  @Transform(({ value }) => cleanValue(value))
  @IsString()
  location?: string;

  @IsOptional()
  @Transform(({ value }) => cleanNumericValue(value))
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => cleanNumericValue(value))
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Handle single string or array of strings
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];

  @IsOptional()
  @Transform(({ value }) => cleanValue(value))
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @IsOptional()
  @Transform(({ value }) => cleanValue(value))
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
