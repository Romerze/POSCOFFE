import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PAYMENT_METHODS, type PaymentMethod } from '@poscoffe/types';

export class CreatePaymentDto {
  @IsIn(PAYMENT_METHODS)
  metodo!: PaymentMethod;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  propina?: number;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  proveedor?: string;
}

export class CancelOrderDto {
  @IsString()
  motivo!: string;
}
