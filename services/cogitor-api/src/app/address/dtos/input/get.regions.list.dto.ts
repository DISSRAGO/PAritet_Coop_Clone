import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetRegionsListDto {
  @ApiProperty({
    example: '1',
    description: 'Идентификатор страны',
  })
  @IsString()
  @IsNotEmpty()
  countryId: string;

  @ApiProperty({
    example: 'Россия',
    description: 'Название страны',
  })
  @IsString()
  @IsNotEmpty()
  countryName: string;
}
