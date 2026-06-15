import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReposicionDto {
  @IsUUID()
  localId!: string;

  @IsUUID()
  insumoId!: string;

  @IsOptional()
  @IsUUID()
  proveedorId?: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  cantidad!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  costo!: number;
}

export class CreateMermaDto {
  @IsUUID()
  localId!: string;

  @IsUUID()
  insumoId!: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  cantidad!: number;

  @IsString()
  motivo!: string;
}

export class AjusteStockDto {
  @IsUUID()
  localId!: string;

  @IsUUID()
  insumoId!: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  delta!: number; // positivo o negativo

  @IsString()
  motivo!: string;
}
