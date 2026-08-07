import { Dispatch } from "react";

import AddressService from "../../api/AddressService";
import { City } from "../../models/address/City";
import { Country } from "../../models/address/Country";
import { House } from "../../models/address/House";
import { Region } from "../../models/address/Region";
import { Street } from "../../models/address/Street";
import { AppDispatch } from "../index";
import { AddressActionEnum } from "../types/address-types";

const getErrorMessage = (error: any): string => {
    const payload = error?.response?.data;

    return (
        payload?.text ||
        payload?.detail ||
        payload?.message ||
        payload?.error ||
        error?.message ||
        "Ошибка загрузки адресных данных"
    );
};

export const AddressActionCreators = {
    getCountiesList:
        (filter: string): Dispatch<AppDispatch> =>
        async (dispatch: AppDispatch) => {
            dispatch({ type: AddressActionEnum.GET_COUNTRY_REQUEST });
            AddressService.getCountryList(filter)
                .then((data: Country[]) => {
                    dispatch({
                        type: AddressActionEnum.GET_COUNTRY_SUCCESS,
                        payload: data,
                    });
                })
                .catch((error: any) => {
                    dispatch({
                        type: AddressActionEnum.GET_COUNTRY_FAILURE,
                        payload: getErrorMessage(error),
                    });
                });
        },

    getRegionsList:
        (filter: string, country: Country): Dispatch<AppDispatch> =>
        async (dispatch: AppDispatch) => {
            dispatch({ type: AddressActionEnum.GET_REGION_REQUEST });
            AddressService.getRegionList(filter, country)
                .then((data: Region[]) => {
                    dispatch({
                        type: AddressActionEnum.GET_REGION_SUCCESS,
                        payload: data,
                    });
                })
                .catch((error: any) => {
                    dispatch({
                        type: AddressActionEnum.GET_REGION_FAILURE,
                        payload: getErrorMessage(error),
                    });
                });
        },

    getCitiesList:
        (
            filter: string,
            country: Country,
            city: City,
        ): Dispatch<AppDispatch> =>
        async (dispatch: AppDispatch) => {
            dispatch({ type: AddressActionEnum.GET_CITY_REQUEST });
            AddressService.getCityList(filter, country, city)
                .then((data: City[]) => {
                    dispatch({
                        type: AddressActionEnum.GET_CITY_SUCCESS,
                        payload: data,
                    });
                })
                .catch((error: any) => {
                    dispatch({
                        type: AddressActionEnum.GET_CITY_FAILURE,
                        payload: getErrorMessage(error),
                    });
                });
        },

    getStreetsList:
        (
            filter: string,
            country: Country,
            region: Region,
            city: City,
        ): Dispatch<AppDispatch> =>
        async (dispatch: AppDispatch) => {
            dispatch({ type: AddressActionEnum.GET_STREET_REQUEST });
            AddressService.getStreetList(filter, country, region, city)
                .then((data: Street[]) => {
                    dispatch({
                        type: AddressActionEnum.GET_STREET_SUCCESS,
                        payload: data,
                    });
                })
                .catch((error: any) => {
                    dispatch({
                        type: AddressActionEnum.GET_STREET_FAILURE,
                        payload: getErrorMessage(error),
                    });
                });
        },

    getHousesList:
        (
            filter: string,
            country: Country,
            region: Region,
            city: City,
            street: Street,
        ): Dispatch<AppDispatch> =>
        async (dispatch: AppDispatch) => {
            dispatch({ type: AddressActionEnum.GET_HOUSE_REQUEST });
            AddressService.getHouseList(filter, country, region, city, street)
                .then((data: House[]) => {
                    dispatch({
                        type: AddressActionEnum.GET_HOUSE_SUCCESS,
                        payload: data,
                    });
                })
                .catch((error: any) => {
                    dispatch({
                        type: AddressActionEnum.GET_HOUSE_FAILURE,
                        payload: getErrorMessage(error),
                    });
                });
        },

    getAddressId:
        (
            filter: string,
            country: Country,
            region: Region,
            city: City,
            street: Street,
            house: House,
        ): Dispatch<AppDispatch> =>
        async (dispatch: AppDispatch) => {
            dispatch({ type: AddressActionEnum.GET_ADDRESS_ID_REQUEST });
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
                .catch((error: any) => {
                    dispatch({
                        type: AddressActionEnum.GET_ADDRESS_ID_FAILURE,
                        payload: getErrorMessage(error),
                    });
                });
        },
};