import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class GetAddressIdHouseDto {
  @ApiProperty({
    example: '',
    description: '',
  })
  @IsNumber()
  @IsPositive()
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
  @IsNumber()
  @IsPositive()
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
  @IsNumber()
  @IsPositive()
  cityId: number;

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsString()
  @IsNotEmpty()
  cityName: string;

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsNumber()
  @IsPositive()
  streetId: number;

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsString()
  @IsNotEmpty()
  streetName: string;

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsNumber()
  @IsPositive()
  houseId: number;

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsString()
  @IsNotEmpty()
  houseName: string;
}
