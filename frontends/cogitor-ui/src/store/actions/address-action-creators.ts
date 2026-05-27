import {Dispatch} from "react";

import AddressService from "../../api/AddressService";
import {ServerError} from "../../models/IServerError";
import {ICity} from "../../models/address/ICity";
import {ICountry} from "../../models/address/ICountry";
import {IHouse} from "../../models/address/IHouse";
import {IRegion} from "../../models/address/IRegion";
import {IStreet} from "../../models/address/IStreet";
import {AppDispatch} from "../index";
import {AddressActionEnum} from "../types/address-types";

export const AddressActionCreators = {
	getCountiesList:
		(filter: string): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({type: AddressActionEnum.GET_COUNTRY_REQUEST});
			AddressService.getCountryList(filter)
				.then((data: ICountry[]) => {
					dispatch({
						type: AddressActionEnum.GET_COUNTRY_SUCCESS,
						payload: data,
					});
				})
				.catch((error: any) => {
					error.json().then((e: ServerError) => {
						dispatch({
							type: AddressActionEnum.GET_COUNTRY_FAILURE,
							payload: e.text,
						});
					});
				});
		},

	getRegionsList:
		(filter: string, country: ICountry): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({type: AddressActionEnum.GET_REGION_REQUEST});
			AddressService.getRegionList(filter, country)
				.then((data: IRegion[]) => {
					dispatch({
						type: AddressActionEnum.GET_REGION_SUCCESS,
						payload: data,
					});
				})
				.catch((error) => {
					error.json().then((e: ServerError) => {
						dispatch({
							type: AddressActionEnum.GET_REGION_FAILURE,
							payload: e.text,
						});
					});
				});
		},

	getCitiesList:
		(
			filter: string,
			country: ICountry,
			city: ICity,
		): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({type: AddressActionEnum.GET_CITY_REQUEST});
			AddressService.getCityList(filter, country, city)
				.then((data: ICity[]) => {
					dispatch({
						type: AddressActionEnum.GET_CITY_SUCCESS,
						payload: data,
					});
				})
				.catch((error) => {
					error.json().then((e: ServerError) => {
						dispatch({
							type: AddressActionEnum.GET_CITY_FAILURE,
							payload: e.text,
						});
					});
				});
		},

	getStreetsList:
		(
			filter: string,
			country: ICountry,
			region: IRegion,
			city: ICity,
		): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({type: AddressActionEnum.GET_STREET_REQUEST});
			AddressService.getStreetList(filter, country, region, city)
				.then((data: IStreet[]) => {
					dispatch({
						type: AddressActionEnum.GET_STREET_SUCCESS,
						payload: data,
					});
				})
				.catch((error) => {
					error.json().then((e: ServerError) => {
						dispatch({
							type: AddressActionEnum.GET_STREET_FAILURE,
							payload: e.text,
						});
					});
				});
		},

	getHousesList:
		(
			filter: string,
			country: ICountry,
			region: IRegion,
			city: ICity,
			street: IStreet,
		): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({type: AddressActionEnum.GET_HOUSE_REQUEST});
			AddressService.getHouseList(filter, country, region, city, street)
				.then((data: IHouse[]) => {
					dispatch({
						type: AddressActionEnum.GET_HOUSE_SUCCESS,
						payload: data,
					});
				})
				.catch((error) => {
					error.json().then((e: ServerError) => {
						dispatch({
							type: AddressActionEnum.GET_HOUSE_FAILURE,
							payload: e.text,
						});
					});
				});
		},
	getAddressId:
		(
			filter: string,
			country: ICountry,
			region: IRegion,
			city: ICity,
			street: IStreet,
			house: IHouse,
		): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({type: AddressActionEnum.GET_ADDRESS_ID_REQUEST});
			AddressService.getAddressIdList(
				filter,
				country,
				region,
				city,
				street,
				house,
			)
				.then((data: number) => {
					dispatch({
						type: AddressActionEnum.GET_ADDRESS_ID_SUCCESS,
						payload: data,
					});
				})
				.catch((error) => {
					error.json().then((e: ServerError) => {
						dispatch({
							type: AddressActionEnum.GET_ADDRESS_ID_FAILURE,
							payload: e.text,
						});
					});
				});
		},
};
