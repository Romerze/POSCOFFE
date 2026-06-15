import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateCajaDto {
  @IsUUID()
  localId!: string;

  @IsString()
  @MaxLength(60)
  nombre!: string;
}

export class AbrirTurnoDto {
  @IsUUID()
  localId!: string;

  @IsUUID()
  cajaId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoInicial!: number;
}

export class RetiroDto {
  @IsUUID()
  turnoId!: string;

  @IsUUID()
  cajaId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto!: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}

export class CerrarCajaDto {
  @IsUUID()
  turnoId!: string;

  @IsUUID()
  cajaId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  efectivoContado!: number;
}
