import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLocalDto {
  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  moneda?: string;
}

export class UpdateLocalDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  moneda?: string;
}
