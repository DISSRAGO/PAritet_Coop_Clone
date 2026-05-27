import {Dispatch} from "react";

import UserService from "../../api/UserService";
import {IUserProfile} from "../../models/profile/IUserProfile";
import {AppDispatch} from "../index";
import {UserActionsTypes} from "../types/user-types";

export const UserActionsCreators = {
	getProfile: (): Dispatch<AppDispatch> => async (dispatch: AppDispatch) => {
		dispatch({
			type: UserActionsTypes.GET_PROFILE_REQUEST,
		});
		UserService.getProfile()
			.then((data: any) => {
				dispatch({
					type: UserActionsTypes.GET_PROFILE_SUCCESS,
					payload: data,
				});
			})
			.catch((error: any) => {
				error.json().then((e: any) => {
					dispatch({
						type: UserActionsTypes.GET_PROFILE_FAILURE,
						payload: e.text,
					});
				});
			});
	},

	saveProfile:
		(userProfile: IUserProfile): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({
				type: UserActionsTypes.SAVE_PROFILE_REQUEST,
			});
			UserService.saveUserProfile(userProfile)
				.then((data) => {
					dispatch({
						type: UserActionsTypes.SAVE_PROFILE_SUCCESS,
					});
				})
				.catch((error) => {
					error.json().then((e: any) => {
						dispatch({
							type: UserActionsTypes.SAVE_PROFILE_FAILURE,
							payload: e.text,
						});
					});
				});
		},

	saveProfileAddress:
		(userProfile: IUserProfile): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({
				type: UserActionsTypes.SAVE_PROFILE_ADDRESS_REQUEST,
			});
			UserService.saveUserProfile(userProfile)
				.then((data) => {
					dispatch({
						type: UserActionsTypes.SAVE_PROFILE_ADDRESS_SUCCESS,
					});
				})
				.catch((error) => {
					error.json().then((e: any) => {
						dispatch({
							type: UserActionsTypes.SAVE_PROFILE_ADDRESS_FAILURE,
							payload: e.text,
						});
					});
				});
		},

	getAccount: (): Dispatch<AppDispatch> => async (dispatch: AppDispatch) => {
		dispatch({
			type: UserActionsTypes.GET_ACCOUNT_REQUEST,
		});
		UserService.getAccount()
			.then((data) => {
				dispatch({
					type: UserActionsTypes.GET_ACCOUNT_SUCCESS,
					payload: data,
				});
			})
			.catch((error) => {
				error.json().then((e: any) => {
					dispatch({
						type: UserActionsTypes.GET_ACCOUNT_FAILURE,
						payload: e.text,
					});
				});
			});
	},

	getHeaderInformation:
		(): Dispatch<AppDispatch> => async (dispatch: AppDispatch) => {
			dispatch({
				type: UserActionsTypes.GET_HEADER_INFO_REQUEST,
			});
			UserService.getHeaderInformation()
				.then((data) => {
					dispatch({
						type: UserActionsTypes.GET_HEADER_INFO_SUCCESS,
						payload: data,
					});
				})
				.catch((error) => {
					error.json().then((e: any) => {
						dispatch({
							type: UserActionsTypes.GET_HEADER_INFO_FAILURE,
							payload: e.text,
						});
					});
				});
		},
	getOperationHistoryByAccount:
		(
			accountId: string,
			dateBegin: string,
			dateEnd: string,
		): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({
				type: UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_REQUEST,
			});
			UserService.getOperationHistoryByAccount(
				accountId,
				dateBegin,
				dateEnd,
			)
				.then((data) => {
					dispatch({
						type: UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_SUCCESS,
						payload: data,
					});
				})
				.catch((error) => {
					error.json().then((e: any) => {
						dispatch({
							type: UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_FAILURE,
							payload: e.text,
						});
					});
				});
		},
};
