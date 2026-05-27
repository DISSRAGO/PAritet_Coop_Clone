import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetStreetsListDto {
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
  countryName: string;

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

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsString()
  @IsNotEmpty()
  cityId: number;

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsString()
  @IsNotEmpty()
  cityName: string;
}
