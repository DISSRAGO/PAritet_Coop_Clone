import { ApiProperty } from '@nestjs/swagger';

export class FlatDto {
  @ApiProperty({
    description: 'Идентификатор квартиры',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Номер квартиры',
    type: String,
  })
  name: string;
}
