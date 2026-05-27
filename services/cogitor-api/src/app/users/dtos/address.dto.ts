import { ApiProperty } from '@nestjs/swagger';
import { CountryDto } from './country.dto';
import { RegionDto } from './region.dto';
import { CityDto } from './city.dto';
import { StreetDto } from './street.dto';
import { HouseDto } from './house.dto';
import { FlatDto } from './flat.dto';

export class AddressDto {
  @ApiProperty({
    description: 'Идентификатор адреса',
  })
  id?: number;

  @ApiProperty({
    description: 'страна',
  })
  country?: CountryDto;

  @ApiProperty({
    description: 'регион',
  })
  region?: RegionDto;

  @ApiProperty({
    description: 'город',
  })
  city?: CityDto;

  @ApiProperty({
    description: 'улица',
  })
  street?: StreetDto;

  @ApiProperty({
    description: 'дом',
  })
  house?: HouseDto;

  @ApiProperty({
    description: 'квартира',
  })
  flat?: FlatDto;
}
