import { ApiProperty } from '@nestjs/swagger';

export class HouseDto {
  @ApiProperty({
    description: 'Идентификатор дома',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Номер дома',
    type: String,
  })
  name: string;
}
