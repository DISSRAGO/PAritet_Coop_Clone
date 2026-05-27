import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { RequestUrl, WsdlUrl } from '../constants/url.constants';
import { CountryDto } from './dtos/output/country.dto';
import { RegionDto } from './dtos/output/region.dto';
import { CityDto } from './dtos/output/city.dto';
import { StreetDto } from './dtos/output/street.dto';
import { HouseDto } from './dtos/output/house.dto';
import { GetRegionsListDto } from './dtos/input/get.regions.list.dto';
import { GetCitiesListDto } from './dtos/input/get.cities.list.dto';
import { GetHouseListDto } from './dtos/input/get.houses.list.dto';
import { GetStreetsListDto } from './dtos/input/get.streets.list.dto';
import { GetAddressIdFlatDto } from './dtos/input/get.address.id.flat.dto';
import { GetAddressIdHouseDto } from './dtos/input/get.address.id.house.dto';
import { createClientAsync } from '../../../libs/data-access/api2.social.address.service/src';
import { AddressConverter } from './address.converter';

@Injectable()
export class AddressService {
  constructor(
    private wsdlUrl: WsdlUrl,
    private requestUrl: RequestUrl,
    private addressConverter: AddressConverter,
  ) {}

  /**
   * Метод, который получает список стран из бд
   *
   * @async
   * @function getCountryList
   * @returns {Promise<Array<CountryDto>>} Возвращает promise со списком стран
   */
  async getCountryList(): Promise<Array<CountryDto>> {
    const addressClient = await createClientAsync(
      this.wsdlUrl.ADDRESS_WSDL_URL,
    );
    return await addressClient
      .GetCountryListAsync({})
      .then((data) =>
        this.addressConverter.convertCountryFromDatabaseToModel(
          data[0].Result?.Country ?? [],
        ),
      )
      .catch((err) => {
        throw new HttpException(
          err.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  /**
   * Метод, который получает список регионов из бд
   *
   * @async
   * @function getRegionList
   * @param dto {GetRegionsListDto} - аргумент, включающий в себя:
   *     1. CountryId - id страны, в которой мы должны получить список регионов;
   *     2. CountryName - название страны, в которой мы должны получить список стран;
   *     3. filter - параметр, который позволяет фильтровать список стран;
   * @returns {Promise<Array<RegionDto>>} Возвращает promise со списком регионов определённой страны
   */
  async getRegionList(dto: GetRegionsListDto): Promise<Array<RegionDto>> {
    const addressClient = await createClientAsync(
      this.wsdlUrl.ADDRESS_WSDL_URL,
    );
    addressClient.addSoapHeader({ connection: 'keep-alive' });
    addressClient.setEndpoint(this.requestUrl.ADDRESS_URL);
    return addressClient
      .GetRegionListAsync({
        CountryId: dto.countryId.toString(),
        CountryName: dto.countryName,
      })
      .then((data) =>
        this.addressConverter.convertRegionFromDatabaseToModel(
          data[0].Result?.Region ?? [],
        ),
      )
      .catch((err) => {
        throw new HttpException(
          err.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }
  /**
   * Метод, который получает список городов из бд
   *
   * @async
   * @function getCityList
   *     1. CountryId - id страны, в которой находится регион;
   *     2. RegionId - id региона, в котором мы должны получить список городов;
   *     3. RegionName - название региона, в которой мы должны получить список городов;
   *     4. filter - параметр, который позволяет фильтровать список стран;
   * @returns {Promise<Array<CityDto>>} возвращает promise со списком городов
   * @param dto
   */
  async getCityList(dto: GetCitiesListDto): Promise<Array<CityDto>> {
    const addressClient = await createClientAsync(
      this.wsdlUrl.ADDRESS_WSDL_URL,
    );
    addressClient.addSoapHeader({ connection: 'keep-alive' });
    addressClient.setEndpoint(this.requestUrl.ADDRESS_URL);
    return addressClient
      .GetCityListAsync({
        CountryId: dto.countryId.toString(),
        RegionId: dto.regionId.toString(),
        RegionName: dto.regionName,
      })
      .then((data) =>
        this.addressConverter.convertCityFromDatabaseToModel(
          data[0].Result?.City ?? [],
        ),
      )
      .catch((err) => {
        throw new HttpException(
          err.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  /**
   * Метод, который получает список улиц из бд
   *
   * @async
   * @function getStreetList
   * @param args{GetStreetsListDto} - аргумент, включающий в себя:
   *     1. CountryId - id страны, в которой находится регион;
   *     2. RegionId - id региона, в котором мы нашли город;
   *     3. CityId - id города, в котором мы ищем город;
   *     4. CountryName - название страны, в котором
   *     5. RegionName - название региона, в которой мы должны получить список городов;
   *     6. CityName - название города, в котором
   *     7. filter - параметр, который позволяет фильтровать список стран;
   * @returns {Promise<Array<StreetDto>>} возвращает promise со списком улиц
   */
  async getStreetList(dto: GetStreetsListDto): Promise<Array<StreetDto>> {
    const addressClient = await createClientAsync(
      this.wsdlUrl.ADDRESS_WSDL_URL,
    );
    addressClient.addSoapHeader({ connection: 'keep-alive' });
    addressClient.setEndpoint(this.requestUrl.ADDRESS_URL);
    return addressClient
      .GetStreetListAsync({
        CountryId: dto.countryId.toString(),
        CountryName: dto.countryName,
        RegionId: dto.regionId.toString(),
        RegionName: dto.regionName,
        CityId: dto.cityId.toString(),
        CityName: dto.cityName,
      })
      .then((data) =>
        this.addressConverter.convertStreetFromDatabaseToModel(
          data[0].Result?.Street ?? [],
        ),
      )
      .catch((err) => {
        throw new HttpException(
          err.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }
  /**
   * Метод, который получает список домов из бд
   *
   * @async
   * @function getHouseList
   * @param args{GetHouseList} - аргумент, включающий в себя:
   *     1. CountryId - id страны, в которой находится регион;
   *     2. RegionId - id региона, в котором мы нашли город;
   *     3. CityId - id города, в котором мы ищем город;
   *     4. StreetId - id улицы
   *     5. CountryName - название страны, в котором
   *     6. RegionName - название региона, в которой мы должны получить список городов;
   *     7. CityName - название города, в котором
   *     8. StreetName - название улицы
   *     7. filter - параметр, который позволяет фильтровать список стран;
   * @returns {Promise<Array<HouseDto>>} Возвращает promise со списком городов
   */
  async getHouseList(dto: GetHouseListDto): Promise<Array<HouseDto>> {
    const addressClient = await createClientAsync(
      this.wsdlUrl.ADDRESS_WSDL_URL,
    );
    addressClient.addSoapHeader({ connection: 'keep-alive' });
    addressClient.setEndpoint(this.requestUrl.ADDRESS_URL);
    return addressClient
      .GetHouseListAsync({
        CountryId: dto.countryId.toString(),
        CountryName: dto.countryName,
        RegionId: dto.regionId.toString(),
        RegionName: dto.regionName,
        CityId: dto.cityId.toString(),
        CityName: dto.cityName,
        StreetId: dto.streetId.toString(),
        StreetName: dto.streetName,
      })
      .then((data) =>
        this.addressConverter.convertHouseFromDatabaseToModel(
          data[0].Result?.House || [],
        ),
      )
      .catch((err) => {
        throw new HttpException(
          err.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }
  /**
   * Метод, который получает идентификатор определённого адреса из бд
   *
   * @async
   * @function getAddressId
   * @returns {Promise<Array<string>>} Возвращает promise со списком стран
   * @param args
   *     1.Type -
   *     2. CountryId - id страны, в которой находится регион;
   *     3. RegionId - id региона, в котором мы нашли город;
   *     4. CityId - id города, в котором мы ищем город;
   *     5. StreetId
   *     6. HouseId
   *     7. AddressId
   *     8. CountryName
   *     9. RegionName
   *     10. CityName
   *     11. StreetName
   *     12. HouseName
   *     13. AddressName
   */
  async getAddressIdHouse(dto: GetAddressIdHouseDto): Promise<string> {
    const addressClient = await createClientAsync(
      this.wsdlUrl.ADDRESS_WSDL_URL,
    );
    addressClient.addSoapHeader({ connection: 'keep-alive' });
    addressClient.setEndpoint(this.requestUrl.ADDRESS_URL);
    return addressClient
      .GettingAddressIdAsync({
        Type: 'House',
        CountryId: dto.countryId.toString(),
        CountryName: dto.countryName,
        RegionId: dto.regionId.toString(),
        RegionName: dto.regionName,
        CityId: dto.cityId.toString(),
        CityName: dto.cityName,
        StreetId: dto.streetId.toString(),
        StreetName: dto.streetName,
        HouseId: dto.houseId.toString(),
        HouseName: dto.houseName,
      })
      .then((data) => data[0]?.Id ?? '')
      .catch((err) => {
        throw new HttpException(
          err.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }

  async getAddressIdFlat(dto: GetAddressIdFlatDto): Promise<string> {
    const addressClient = await createClientAsync(
      this.wsdlUrl.ADDRESS_WSDL_URL,
    );
    addressClient.addSoapHeader({ connection: 'keep-alive' });
    addressClient.setEndpoint(this.requestUrl.ADDRESS_URL);
    return addressClient
      .GettingAddressIdAsync({
        Type: 'Flat',
        CountryId: dto.countryId.toString(),
        CountryName: dto.countryName,
        RegionId: dto.regionId.toString(),
        RegionName: dto.regionName,
        CityId: dto.cityId.toString(),
        CityName: dto.cityName,
        StreetId: dto.streetId.toString(),
        StreetName: dto.streetName,
        HouseId: dto.houseId.toString(),
        HouseName: dto.houseName,
      })
      .then((data) => data[0]?.Id ?? '')
      .catch((err) => {
        throw new HttpException(
          err.root?.Envelope?.Body?.Fault?.detail?.error?.text ?? err,
          HttpStatus.NOT_FOUND,
        );
      });
  }
}
