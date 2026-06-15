import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ORDER_CHANNELS, type OrderChannel } from '@poscoffe/types';

export class OrderItemDto {
  @IsUUID()
  varianteId!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  modificadorIds?: string[];
}

export class CreateOrderDto {
  /** UUID v7 generado en el cliente (offline-first). Si falta, lo genera el server. */
  @IsOptional()
  @IsUUID()
  id?: string;

  /** Idempotencia de sincronización. */
  @IsUUID()
  operationId!: string;

  @IsUUID()
  localId!: string;

  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsIn(ORDER_CHANNELS)
  canal!: OrderChannel;

  @IsOptional()
  @IsString()
  mesa?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
