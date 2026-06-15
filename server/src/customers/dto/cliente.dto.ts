import { IsEmail, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CanjearDto {
  @IsUUID()
  clienteId!: string;

  @IsInt()
  @Min(1)
  puntos!: number;

  @IsOptional()
  @IsString()
  concepto?: string;
}
