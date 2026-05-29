import { Dispatch } from "react";

import UserService from "../../api/UserService";
import { IOperationHistory } from "../../models/profile/IOperationHistory";
import { IHeaderInfo } from "../../models/profile/IHeaderInfo";
import { IUserProfile } from "../../models/profile/IUserProfile";
import { IAccount } from "../../models/profile/IAccount";
import { AppDispatch } from "../index";
import { UserActionsTypes } from "../types/user-types";

type GetAccountResponse = {
	account: IAccount;
	payLink: string;
};

const extractErrorMessage = async (
	error: any,
	fallback: string,
): Promise<string> => {
	if (error && typeof error.json === "function") {
		try {
			const e = await error.json();
			return e?.message || e?.text || fallback;
		} catch (_) {
			return fallback;
		}
	}

	return error?.message || fallback;
};

export const UserActionsCreators = {
	getProfile: (): Dispatch<AppDispatch> => async (dispatch: AppDispatch) => {
		dispatch({
			type: UserActionsTypes.GET_PROFILE_REQUEST,
		});

		UserService.getProfile()
			.then((data: IUserProfile) => {
				dispatch({
					type: UserActionsTypes.GET_PROFILE_SUCCESS,
					payload: data,
				});
			})
			.catch(async (error: any) => {
				const message = await extractErrorMessage(
					error,
					"Ошибка загрузки профиля",
				);

				dispatch({
					type: UserActionsTypes.GET_PROFILE_FAILURE,
					payload: message,
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
				.then(() => {
					dispatch({
						type: UserActionsTypes.SAVE_PROFILE_SUCCESS,
					});
				})
				.catch(async (error: any) => {
					const message = await extractErrorMessage(
						error,
						"Ошибка сохранения профиля",
					);

					dispatch({
						type: UserActionsTypes.SAVE_PROFILE_FAILURE,
						payload: message,
					});
				});
		},

	saveProfileAddress:
		(userProfile: IUserProfile): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({
				type: UserActionsTypes.SAVE_PROFILE_ADDRESS_REQUEST,
			});

			UserService.saveUserProfileAddress(userProfile)
				.then(() => {
					dispatch({
						type: UserActionsTypes.SAVE_PROFILE_ADDRESS_SUCCESS,
					});
				})
				.catch(async (error: any) => {
					const message = await extractErrorMessage(
						error,
						"Ошибка сохранения адреса",
					);

					dispatch({
						type: UserActionsTypes.SAVE_PROFILE_ADDRESS_FAILURE,
						payload: message,
					});
				});
		},

	getHeaderInformation:
		(): Dispatch<AppDispatch> => async (dispatch: AppDispatch) => {
			dispatch({
				type: UserActionsTypes.GET_HEADER_INFO_REQUEST,
			});

			UserService.getHeaderInformation()
				.then((data: IHeaderInfo) => {
					dispatch({
						type: UserActionsTypes.GET_HEADER_INFO_SUCCESS,
						payload: data,
					});
				})
				.catch(async (error: any) => {
					const message = await extractErrorMessage(
						error,
						"Ошибка загрузки данных шапки",
					);

					dispatch({
						type: UserActionsTypes.GET_HEADER_INFO_FAILURE,
						payload: message,
					});
				});
		},

	getAccount: (): Dispatch<AppDispatch> => async (dispatch: AppDispatch) => {
		dispatch({
			type: UserActionsTypes.GET_ACCOUNT_REQUEST,
		});

		UserService.getAccount()
			.then((data: any) => {
				const payload: GetAccountResponse = {
					account: data.account,
					payLink: data.payLink,
				};

				dispatch({
					type: UserActionsTypes.GET_ACCOUNT_SUCCESS,
					payload,
				});
			})
			.catch(async (error: any) => {
				const message = await extractErrorMessage(
					error,
					"Ошибка загрузки аккаунта",
				);

				dispatch({
					type: UserActionsTypes.GET_ACCOUNT_FAILURE,
					payload: message,
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
				.then((data: IOperationHistory) => {
					dispatch({
						type: UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_SUCCESS,
						payload: data,
					});
				})
				.catch(async (error: any) => {
					const message = await extractErrorMessage(
						error,
						"Ошибка загрузки истории операций",
					);

					dispatch({
						type: UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_FAILURE,
						payload: message,
					});
				});
		},
};