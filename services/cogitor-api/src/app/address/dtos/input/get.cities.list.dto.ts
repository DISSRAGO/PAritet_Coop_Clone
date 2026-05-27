import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class GetCitiesListDto {
  @ApiProperty({
    example: '',
    description: '',
  })
  @IsString()
  @IsNotEmpty()
  countryId: number;

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsString()
  @IsNotEmpty()
  regionId: number;

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsString()
  @IsNotEmpty()
  regionName: string;
}
