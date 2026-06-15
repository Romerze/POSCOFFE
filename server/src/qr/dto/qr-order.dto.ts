import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { OrderItemDto } from '../../sales/dto/create-order.dto';

/** Pedido público desde QR/pick-up (sin operador de caja). */
export class QrOrderDto {
  @IsUUID()
  operationId!: string;

  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsIn(['qr', 'pickup'])
  canal!: 'qr' | 'pickup';

  @IsOptional()
  mesa?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
