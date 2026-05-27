import { CountryDto } from './dtos/output/country.dto';
import { RegionDto } from './dtos/output/region.dto';
import { CityDto } from './dtos/output/city.dto';
import { StreetDto } from './dtos/output/street.dto';
import { HouseDto } from './dtos/output/house.dto';
import { ManagementCompany } from '../../../libs/data-access/api2.social.address.service/src';
export class AddressConverter {
  convertCountryFromDatabaseToModel(
    countries: ManagementCompany[],
  ): CountryDto[] {
    const result: CountryDto[] = [];
    for (let i = 0; i < countries.length; ++i) {
      result.push({
        id: Number.parseInt(countries[i].attributes.Id),
        name: countries[i].attributes.Name,
      });
    }
    return result;
  }

  convertRegionFromDatabaseToModel(
    regions: ManagementCompany[],
  ): RegionDto[] {
    const result: RegionDto[] = [];
    for (let i = 0; i < regions.length; ++i) {
      result.push({
        id: Number.parseInt(regions[i].attributes.Id),
        name: regions[i].attributes.Name,
      });
    }
    return result;
  }

   convertCityFromDatabaseToModel(
    cities: ManagementCompany[],
  ): CityDto[] {
    const result: CityDto[] = [];
    for (let i = 0; i < cities.length; ++i) {
      result.push({
        id: Number.parseInt(cities[i].attributes.Id),
        name: cities[i].attributes.Name,
      });
    }
    return result;
  }

   convertStreetFromDatabaseToModel(
    streets: ManagementCompany[],
  ): StreetDto[] {
    const result: StreetDto[] = [];
    for (let i = 0; i < streets.length; ++i) {
      result.push({
        id: Number.parseInt(streets[i].attributes.Id),
        name: streets[i].attributes.Name,
      });
    }
    return result;
  }

  convertHouseFromDatabaseToModel(
    countries: ManagementCompany[],
  ): HouseDto[] {
    const result: HouseDto[] = [];
    for (let i = 0; i < countries.length; ++i) {
      result.push({
        id: Number.parseInt(countries[i].attributes.Id),
        name: countries[i].attributes.Name,
      });
    }
    return result;
  }
}
