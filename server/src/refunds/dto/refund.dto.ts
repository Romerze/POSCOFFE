import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class RefundItemDto {
  @IsUUID()
  detallePedidoId!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class CreateRefundDto {
  @IsString()
  motivo!: string;

  @IsOptional()
  @IsBoolean()
  reincorporarStock?: boolean;

  /** Líneas a devolver. Omitir = devolución total. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RefundItemDto)
  items?: RefundItemDto[];
}
