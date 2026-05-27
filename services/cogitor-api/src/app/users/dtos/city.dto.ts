import { ApiProperty } from '@nestjs/swagger';

export class CityDto {
  @ApiProperty({
    description: 'Идентификатор города',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Идентификатор название',
    type: String,
  })
  name: string;
}
