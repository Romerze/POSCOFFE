import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSuscripcionDto {
  @IsUUID()
  clienteId!: string;

  @IsString()
  plan!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio!: number;

  @IsInt()
  @Min(1)
  duracionDias!: number;

  /** Máximo de consumos en el periodo. Omitir = ilimitado. */
  @IsOptional()
  @IsInt()
  @Min(1)
  limiteConsumos?: number;
}

export class ConsumirDto {
  @IsUUID()
  pedidoId!: string;
}
