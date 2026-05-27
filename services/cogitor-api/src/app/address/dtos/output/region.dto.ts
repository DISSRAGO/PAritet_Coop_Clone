import { ApiProperty } from '@nestjs/swagger';

export class RegionDto {
  @ApiProperty({
    description: 'Идентификатор региона',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Название региона',
    type: String,
  })
  name: string;
}
