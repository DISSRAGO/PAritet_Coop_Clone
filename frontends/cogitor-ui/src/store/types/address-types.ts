import {City} from "../../models/address/City";
import {Country} from "../../models/address/Country";
import {Flat} from "../../models/address/Flat";
import {House} from "../../models/address/House";
import {Region} from "../../models/address/Region";
import {Street} from "../../models/address/Street";
import {FetchStatus} from "./fetchTypes";

export interface AddressState {
	countries: {
		status: FetchStatus;
		data: Array<Country>;
		error: string | null;
	};
	regions: {
		status: FetchStatus;
		data: Array<Region>;
		error: string | null;
	};
	cities: {
		status: FetchStatus;
		data: Array<City>;
		error: string | null;
	};
	streets: {
		status: FetchStatus;
		data: Array<Street>;
		error: string | null;
	};
	houses: {
		status: FetchStatus;
		data: Array<House>;
		error: string | null;
	};
	flats: {
		status: FetchStatus;
		data: Array<Flat>;
		error: string | null;
	};
	addressId: {
		status: FetchStatus;
		data: number;
		error: string | null;
	};
}
export enum AddressActionEnum {
	GET_COUNTRY_REQUEST = "GET_COUNTRY_REQUEST",
	GET_COUNTRY_SUCCESS = "GET_COUNTRY_SUCCESS",
	GET_COUNTRY_FAILURE = "GET_COUNTRY_FAILURE",

	GET_REGION_REQUEST = "GET_REGION_REQUEST",
	GET_REGION_SUCCESS = "GET_REGION_SUCCESS",
	GET_REGION_FAILURE = "GET_REGION_FAILURE",

	GET_CITY_REQUEST = "GET_CITY_REQUEST",
	GET_CITY_SUCCESS = "GET_CITY_SUCCESS",
	GET_CITY_FAILURE = "GET_CITY_FAILURE",

	GET_STREET_REQUEST = "GET_STREET_REQUEST",
	GET_STREET_SUCCESS = "GET_STREET_SUCCESS",
	GET_STREET_FAILURE = "GET_STREET_FAILURE",

	GET_HOUSE_REQUEST = "GET_HOUSE_REQUEST",
	GET_HOUSE_SUCCESS = "GET_HOUSE_SUCCESS",
	GET_HOUSE_FAILURE = "GET_HOUSE_FAILURE",

	GET_FLAT_REQUEST = "GET_FLAT_REQUEST",
	GET_FLAT_SUCCESS = "GET_FLAT_SUCCESS",
	GET_FLAT_FAILURE = "GET_FLAT_FAILURE",

	GET_ADDRESS_ID_REQUEST = "GETTING_ADDRESS_ID_REQUEST",
	GET_ADDRESS_ID_SUCCESS = "GETTING_ADDRESS_ID_SUCCESS",
	GET_ADDRESS_ID_FAILURE = "GETTING_ADDRESS_ID_FAILURE",
}

export interface GetCountryRequestAction {
	type: AddressActionEnum.GET_COUNTRY_REQUEST;
}
export interface GetCountrySuccessAction {
	type: AddressActionEnum.GET_COUNTRY_SUCCESS;
	payload: Array<Country>;
}
export interface GetCountryFailureAction {
	type: AddressActionEnum.GET_COUNTRY_FAILURE;
	payload: string;
}

export interface GetRegionRequestAction {
	type: AddressActionEnum.GET_REGION_REQUEST;
}
export interface GetRegionSuccessAction {
	type: AddressActionEnum.GET_REGION_SUCCESS;
	payload: Array<Region>;
}
export interface GetRegionFailureAction {
	type: AddressActionEnum.GET_REGION_FAILURE;
	payload: string;
}

export interface GetCityRequestAction {
	type: AddressActionEnum.GET_CITY_REQUEST;
}
export interface GetCitySuccessAction {
	type: AddressActionEnum.GET_CITY_SUCCESS;
	payload: Array<City>;
}
export interface GetCityFailureAction {
	type: AddressActionEnum.GET_CITY_FAILURE;
	payload: string;
}

export interface GetStreetRequestAction {
	type: AddressActionEnum.GET_STREET_REQUEST;
}
export interface GetStreetSuccessAction {
	type: AddressActionEnum.GET_STREET_SUCCESS;
	payload: Array<Street>;
}
export interface GetStreetFailureAction {
	type: AddressActionEnum.GET_STREET_FAILURE;
	payload: string;
}
export interface GetHouseRequestAction {
	type: AddressActionEnum.GET_HOUSE_REQUEST;
}
export interface GetHouseSuccessAction {
	type: AddressActionEnum.GET_HOUSE_SUCCESS;
	payload: Array<House>;
}
export interface GetHouseFailureAction {
	type: AddressActionEnum.GET_HOUSE_FAILURE;
	payload: string;
}

export interface GetFlatRequestAction {
	type: AddressActionEnum.GET_FLAT_REQUEST;
}
export interface GetFlatSuccessAction {
	type: AddressActionEnum.GET_FLAT_SUCCESS;
	payload: Array<Flat>;
}
export interface GetFlatFailureAction {
	type: AddressActionEnum.GET_FLAT_FAILURE;
	payload: string;
}

export interface GetAddressIdRequestAction {
	type: AddressActionEnum.GET_ADDRESS_ID_REQUEST;
}
export interface GetAddressIdSuccessAction {
	type: AddressActionEnum.GET_ADDRESS_ID_SUCCESS;
	payload: number;
}
export interface GetAddressIdFailureAction {
	type: AddressActionEnum.GET_ADDRESS_ID_FAILURE;
	payload: string;
}

export type AddressAction =
	| GetCountryRequestAction
	| GetCountrySuccessAction
	| GetCountryFailureAction
	| GetRegionRequestAction
	| GetRegionSuccessAction
	| GetRegionFailureAction
	| GetCityRequestAction
	| GetCitySuccessAction
	| GetCityFailureAction
	| GetStreetRequestAction
	| GetStreetSuccessAction
	| GetStreetFailureAction
	| GetHouseRequestAction
	| GetHouseSuccessAction
	| GetHouseFailureAction
	| GetFlatRequestAction
	| GetFlatSuccessAction
	| GetFlatFailureAction
	| GetAddressIdRequestAction
	| GetAddressIdSuccessAction
	| GetAddressIdFailureAction;
