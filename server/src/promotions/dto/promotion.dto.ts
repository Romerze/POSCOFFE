import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class FranjaDto {
  @IsString()
  desde!: string; // "HH:MM"

  @IsString()
  hasta!: string;
}

class CondicionDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FranjaDto)
  franja?: FranjaDto;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  diasSemana?: number[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  montoMinimo?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  varianteIds?: string[];
}

class EfectoDto {
  @IsIn(['porcentaje', 'monto', 'nxm'])
  tipo!: 'porcentaje' | 'monto' | 'nxm';

  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  n?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  m?: number;
}

export class CreatePromocionDto {
  @IsOptional()
  @IsUUID()
  localId?: string;

  @IsString()
  nombre!: string;

  @IsIn(['descuento', 'combo', 'hora_valle', 'nxm'])
  tipo!: string;

  @IsDateString()
  vigenciaDesde!: string;

  @IsDateString()
  vigenciaHasta!: string;

  @IsOptional()
  @IsInt()
  prioridad?: number;

  @ValidateNested()
  @Type(() => CondicionDto)
  condicion!: CondicionDto;

  @ValidateNested()
  @Type(() => EfectoDto)
  efecto!: EfectoDto;
}

export class EvaluarPromosDto {
  @IsUUID()
  localId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartLineDto)
  items!: CartLineDto[];
}

export class CartLineDto {
  @IsUUID()
  varianteId!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioUnit!: number;
}

export class UpdatePromocionDto {
  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @IsOptional()
  @IsInt()
  prioridad?: number;
}
