import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class GetAddressIdFlatDto {
  @ApiProperty({
    example: '1',
    description: 'Идентификатор страны, в которой находится адрес',
  })
  @IsNumber()
  @IsPositive()
  countryId: number;

  @ApiProperty({
    example: 'Россия',
    description: 'Название страны, в которой находится адрес',
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

  @ApiProperty()
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

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsString()
  @IsNotEmpty()
  flat: string;
}
