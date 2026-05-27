import {City} from "../models/address/City";
import {Country} from "../models/address/Country";
import {House} from "../models/address/House";
import {Region} from "../models/address/Region";
import {Street} from "../models/address/Street";
import {Urls} from "../utils/urls";

export default class AddressService {
	static async getCountryList(filter: string): Promise<Array<Country>> {
		return fetch(`${Urls.GET_COUNTRY_LIST_URL}?filter=${filter}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}).then((response) => {
			if (response.ok) {
				return Promise.resolve(response.json());
			}
			return Promise.reject(response.json());
		});
	}

	static async getRegionList(
		filter: string,
		country: Country,
	): Promise<Array<Country>> {
		return fetch(
			`${Urls.GET_REGION_LIST_URL}?filter=${filter}
			&countryId=${country.id}&countryName=${country.name}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		).then((response) => {
			if (response.ok) {
				return response.json();
			}
			return Promise.reject(response);
		});
	}

	static async getCityList(
		filter: string,
		country: Country,
		region: Region,
	): Promise<Array<City>> {
		return fetch(
			`${Urls.GET_CITY_LIST_URL}?filter=${filter}
			&countryId=${country.id}&countryName=${country.name}
			&regionId=${region.id}&regionName=${region.name}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		).then((response) => {
			if (response.ok) {
				return response.json();
			}
			return Promise.reject(response);
		});
	}

	static async getStreetList(
		filter: string,
		country: Country,
		region: Region,
		city: City,
	): Promise<Array<Street>> {
		return fetch(
			`${Urls.GET_STREET_LIST_URL}?filter=${filter}
			&countryId=${country.id}&countryName=${country.name}
			&regionId=${region.id}&regionName=${region.name}
			&cityId=${city.id}&cityName=${city.name}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		).then((response) => {
			if (response.ok) {
				return response.json();
			}
			return Promise.reject(response.json());
		});
	}

	static async getHouseList(
		filter: string,
		country: Country,
		region: Region,
		street: Street,
		city: City,
	): Promise<Array<House>> {
		return fetch(
			`${Urls.GET_HOUSE_LIST_URL}?filter=${filter}
			&countryId=${country.id}&countryName=${country.name}
			&regionId=${region.id}&regionName=${region.name}
			&cityId=${city.id}&cityName=${city.name}
			&streetId=${street.id}&streetName=${street.name}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		).then((response) => {
			if (response.ok) {
				return response.json();
			}
			return Promise.reject(response);
		});
	}

	static async getAddressIdList(
		filter: string,
		country: Country,
		region: Region,
		city: City,
		street: Street,
		house: House,
	): Promise<number> {
		return fetch(
			`${Urls.GET_ADDRESS_ID_URL}?filter=${filter}
			&countryId=${country.id}&countryName=${country.name}
			&regionId=${region.id}&regionName=${region.name}
			&cityId=${city.id}&cityName=${city.name}
			&streetId=${street.id}&streetName=${street.name}
			&houseId=${house.id}&houseName=${house.name}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		).then((response) => {
			if (response.ok) {
				return response.json();
			}
			return Promise.reject(response);
		});
	}
}
