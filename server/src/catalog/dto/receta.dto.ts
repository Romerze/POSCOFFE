import { IsNumber, IsUUID, Min } from 'class-validator';

export class SetRecetaItemDto {
  @IsUUID()
  insumoId!: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  cantidad!: number;
}
