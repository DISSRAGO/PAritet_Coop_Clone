import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../filters';
import { CountryDto } from './dtos/output/country.dto';
import { RegionDto } from './dtos/output/region.dto';
import { GetRegionsListDto } from './dtos/input/get.regions.list.dto';
import { GetCitiesListDto } from './dtos/input/get.cities.list.dto';
import { GetHouseListDto } from './dtos/input/get.houses.list.dto';
import { GetStreetsListDto } from './dtos/input/get.streets.list.dto';
import { AppLogger } from '../logger/logger.service';
import { GetAddressIdFlatDto } from './dtos/input/get.address.id.flat.dto';
import {
  GetAddressIdFlatSwagger,
  GetAddressIdHouseSwagger,
  GetCitiesListSwagger,
  GetCountriesListSwagger,
  GetHousesListSwagger,
  GetRegionsListSwagger,
  GetStreetsListSwagger,
} from './address.swagger';
import { GetAddressIdHouseDto } from './dtos/input/get.address.id.house.dto';

@ApiTags('address')
@Controller('/address')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly logger: AppLogger,
  ) {}

  @GetCountriesListSwagger()
  @Get('/countries')
  @UseFilters(new HttpExceptionFilter())
  async getCountryList(): Promise<Array<CountryDto>> {
    return this.addressService.getCountryList();
  }

  @GetRegionsListSwagger()
  @Get('/regions')
  @UseFilters(new HttpExceptionFilter())
  async getRegionList(
    @Query() query: GetRegionsListDto,
  ): Promise<Array<RegionDto>> {
    return this.addressService.getRegionList(query);
  }

  @GetCitiesListSwagger()
  @Get('/cities')
  @UseFilters(new HttpExceptionFilter())
  async getCityList(@Query() query: GetCitiesListDto) {
    return this.addressService.getCityList(query);
  }

  @GetStreetsListSwagger()
  @Get('/streets')
  @UseFilters(new HttpExceptionFilter())
  async getStreetList(@Query() query: GetStreetsListDto) {
    return this.addressService.getStreetList(query);
  }

  @GetHousesListSwagger()
  @Get('/houses')
  @UseFilters(new HttpExceptionFilter())
  async getHouseList(@Query() query: GetHouseListDto) {
    return this.addressService.getHouseList(query);
  }

  @GetAddressIdHouseSwagger()
  @Get('/addressId/house')
  @UseFilters(new HttpExceptionFilter())
  async getAddressIdHouse(@Query() query: GetAddressIdHouseDto) {
    return this.addressService.getAddressIdHouse(query);
  }

  @GetAddressIdFlatSwagger()
  @Get('/addressId/flat')
  @UseFilters(new HttpExceptionFilter())
  async getAddressIdFlat(@Query() query: GetAddressIdFlatDto) {
    return this.addressService.getAddressIdFlat(query);
  }
}
