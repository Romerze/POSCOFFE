import { IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateRetoDto {
  @IsOptional()
  @IsUUID()
  localId?: string;

  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsIn(['visitas', 'gasto'])
  tipo!: 'visitas' | 'gasto';

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  objetivo!: number;

  @IsInt()
  @Min(1)
  periodoDias!: number;

  @IsInt()
  @Min(0)
  recompensaPuntos!: number;

  @IsString()
  @MaxLength(40)
  insignia!: string;
}
