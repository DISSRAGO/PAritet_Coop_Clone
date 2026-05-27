import { ApiProperty } from '@nestjs/swagger';

export class StreetDto {
  @ApiProperty({
    description: 'Идентификатор города',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Название улицы',
    type: String,
  })
  name: string;
}
