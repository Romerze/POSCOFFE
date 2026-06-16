import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateEncuestaDto {
  @IsUUID()
  pedidoId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  puntaje!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;
}
