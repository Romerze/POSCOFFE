import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateInsumoDto {
  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsString()
  @MaxLength(10)
  unidad!: string; // g, ml, u

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  costoUnitario!: number;

  @IsOptional()
  @IsBoolean()
  perecedero?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  vidaUtilDias?: number;
}

export class UpdateInsumoDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  costoUnitario?: number;

  @IsOptional()
  @IsBoolean()
  perecedero?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  vidaUtilDias?: number;
}

export class SetUmbralesDto {
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  stockMinimo!: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  puntoReorden!: number;
}
