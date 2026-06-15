import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateVarianteDto {
  @IsUUID()
  productoId!: string;

  @IsString()
  @MaxLength(80)
  nombre!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio!: number;
}

export class UpdateVarianteDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nombre?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio?: number;
}
