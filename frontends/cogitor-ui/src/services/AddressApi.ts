import {Country} from "../models/address/Country";
import {Region} from "../models/address/Region";
import {City} from "../models/address/City";
import {Street} from "../models/address/Street";
import {House} from "../models/address/House";

import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {BASE_URL} from "../utils/urls";
export type GetCountriesListResult = Array<Country>;

export type GetRegionsListOptions = {
	country: Country;
};
export type GetRegionsListResult = Array<Region>;

export type GetCitiesListOptions = {
	country: Country;
	region: Region;
};
export type GetCitiesListResult = Array<City>;

export type GetStreetsListOptions = {
	country: Country;
	region: Region;
	city: City;
};
export type GetStreetsListResult = Array<Street>;

export type GetHouseListOptions = {
	country: Country;
	region: Region;
	city: City;
	street: Street;
};
export type GetHouseListResult = Array<House>;

export type GetAddressIdOptions = {
	filter: string;
	country: Country;
	region: Region;
	city: City;
	street: Street;
	house: House;
};
export type GetAddressIdResult = number;

export const addressApi = createApi({
	reducerPath: "addressApi",
	baseQuery: fetchBaseQuery({baseUrl: `${BASE_URL}/api/address`}),
	endpoints: (build) => ({
		getCountriesList: build.query<GetCountriesListResult, void>({
			query: () => {
				return {
					url: `/countries`,
					method: "GET",
				};
			},
		}),
		getRegionsList: build.query<
			GetRegionsListResult,
			GetRegionsListOptions
		>({
			query: ({country}) => {
				return {
					url: `/regions?countryId=${country.id}&countryName=${country.name}`,
					method: "GET",
				};
			},
		}),
		getCitiesList: build.query<GetCitiesListResult, GetCitiesListOptions>({
			query: ({country, region}) => {
				return {
					url: `/cities?
					countryId=${country.id}&countryName=${country.name}&
					regionId=${region.id}&regionName=${region.name}`,
				};
			},
		}),
		getStreetsList: build.query<
			GetStreetsListResult,
			GetStreetsListOptions
		>({
			query: ({country, region, city}) => {
				return {
					url: `/streets?countryId=${country.id}&countryName=${country.name}
			&regionId=${region.id}&regionName=${region.name}
			&cityId=${city.id}&cityName=${city.name}`,
				};
			},
		}),
		getHousesList: build.query<GetHouseListResult, GetHouseListOptions>({
			query: ({country, region, city, street}) => {
				return {
					url: `/houses?
			&countryId=${country.id}&countryName=${country.name}
			&regionId=${region.id}&regionName=${region.name}
			&cityId=${city.id}&cityName=${city.name}
			&streetId=${street.id}&streetName=${street.name}`,
				};
			},
		}),
		getAddressId: build.query<GetAddressIdResult, GetAddressIdOptions>({
			query: ({country, region, city, street, house}) => {
				return {
					url: `/addressId?
					&countryId=${country.id}&countryName=${country.name}
					&regionId=${region.id}&regionName=${region.name}
					&cityId=${city.id}&cityName=${city.name}
					&streetId=${street.id}&streetName=${street.name}
					&houseId=${house.id}&houseName=${house.name}\`,`,
				};
			},
		}),
	}),
});

export const {
	useGetCountriesListQuery,
	useLazyGetRegionsListQuery,
	useLazyGetCitiesListQuery,
	useLazyGetStreetsListQuery,
	useLazyGetHousesListQuery,
	useLazyGetAddressIdQuery,
} = addressApi;
