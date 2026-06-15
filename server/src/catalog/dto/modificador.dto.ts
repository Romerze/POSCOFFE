import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateModificadorGrupoDto {
  @IsString()
  @MaxLength(80)
  nombre!: string;

  @IsOptional()
  @IsIn(['unica', 'multiple'])
  seleccion?: 'unica' | 'multiple';

  @IsOptional()
  @IsInt()
  @Min(0)
  min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  max?: number;

  @IsOptional()
  @IsBoolean()
  obligatorio?: boolean;
}

export class CreateModificadorDto {
  @IsUUID()
  grupoId!: string;

  @IsString()
  @MaxLength(80)
  nombre!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioExtra?: number;

  @IsOptional()
  @IsUUID()
  insumoId?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  cantidadInsumo?: number;
}

export class LinkGrupoProductoDto {
  @IsUUID()
  productoId!: string;

  @IsUUID()
  grupoId!: string;
}
