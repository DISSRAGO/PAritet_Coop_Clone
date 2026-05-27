import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class CountryDto {
  @ApiProperty({
    description: 'Идентификатор страны',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'Название страны',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  name: string;
}
