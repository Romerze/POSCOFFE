import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

export class ComboComponenteDto {
  @IsUUID()
  varianteId!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class SetComboComponentesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ComboComponenteDto)
  items!: ComboComponenteDto[];
}
