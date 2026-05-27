import { applyDecorators } from '@nestjs/common';
import {
  ApiQuery,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { GetCountryDtoResult } from './dtos/output/GetCountryDtoResult';
import { GetRegionsListDto } from './dtos/input/get.regions.list.dto';
import { GetCitiesListDto } from './dtos/input/get.cities.list.dto';
import { GetStreetsListDto } from './dtos/input/get.streets.list.dto';
import { GetHouseListDto } from './dtos/input/get.houses.list.dto';
import { GetAddressIdFlatDto } from './dtos/input/get.address.id.flat.dto';
import { GetAddressIdHouseDto } from './dtos/input/get.address.id.house.dto';

export const GetCountriesListSwagger = (): any => {
  return applyDecorators(
    ApiOperation({ summary: 'Получение списка стран' }),
    ApiOkResponse({
      description: 'Список стран получен успешно',
      type: GetCountryDtoResult,
    }),
    ApiNotFoundResponse({ description: 'Не удалось получить список стран' }),
  );
};

export const GetRegionsListSwagger = (): any => {
  return applyDecorators(
    ApiOperation({ summary: 'Получение списка регионов' }),
    ApiQuery({ type: GetRegionsListDto }),
    ApiOkResponse({
      description: 'Список регионов в стране получен успешно',
    }),
    ApiNotFoundResponse({
      description: 'Не удалось получить список регионов страны',
    }),
  );
};

export const GetCitiesListSwagger = (): any => {
  return applyDecorators(
    ApiOperation({ summary: 'Получение списка городов' }),
    ApiQuery({ type: GetCitiesListDto }),
    ApiOkResponse({
      description: 'Список городов в регионе получен успешно',
    }),
    ApiNotFoundResponse({
      description: 'Не удалось получить список городов определённого региона',
    }),
  );
};

export const GetStreetsListSwagger = (): any => {
  return applyDecorators(
    ApiOperation({ summary: 'Получение списка улиц' }),
    ApiQuery({ type: GetStreetsListDto }),
    ApiOkResponse({
      description: 'Список улиц в определённом городе получен успешно',
    }),
    ApiNotFoundResponse({
      description: 'Не удалось получить список улиц в определённом городе',
    }),
  );
};

export const GetHousesListSwagger = (): any => {
  return applyDecorators(
    ApiOperation({ summary: 'Получение списка домов' }),
    ApiQuery({ type: GetHouseListDto }),
    ApiOkResponse({
      description: 'Список домов на улице получен успешно',
    }),
    ApiNotFoundResponse({
      description: 'Не удалось получить список домов определённой улицы',
    }),
  );
};

export const GetAddressIdHouseSwagger = (): any => {
  return applyDecorators(
    ApiOperation({ summary: 'Получение идентификатора определённого адреса' }),
    ApiQuery({ type: GetAddressIdHouseDto }),
    ApiOkResponse({
      description: 'Id адреса получен успешно',
    }),
    ApiNotFoundResponse({
      description: 'Не удалось получить идентификатор адреса',
    }),
  );
};

export const GetAddressIdFlatSwagger = (): any => {
  return applyDecorators(
    ApiOperation({ summary: 'Получение идентификатора определённого адреса' }),
    ApiQuery({ type: GetAddressIdFlatDto }),
    ApiOkResponse({
      description: 'Id адреса получен успешно',
    }),
    ApiNotFoundResponse({
      description: 'Не удалось получить идентификатор адреса',
    }),
  );
};
