import {IOperationHistory} from "../../models/profile/IOperationHistory";
import {IAccount} from "../../models/profile/IAccount";
import {IHeaderInfo} from "../../models/profile/IHeaderInfo";
import {IUserProfile} from "../../models/profile/IUserProfile";
import {FetchStatus} from "./fetchTypes";

export interface UserState {
	payLink: string;
	operationHistory: IOperationHistory;
	userProfile: {
		status: FetchStatus;
		data: IUserProfile;
		error: string | null;
	};
	saveProfileStatus: {
		status: FetchStatus;
		error: string | null;
	};
	saveProfileAddressStatus: {
		status: FetchStatus;
		error: string | null;
	};
	headerInfo: {
		status: FetchStatus;
		data: IHeaderInfo;
		error: string | null;
	};

	account: {
		status: FetchStatus;
		data: IAccount;
		error: string | null;
	};
}
export enum UserActionsTypes {
	GET_PROFILE_REQUEST = "GET_PROFILE_REQUEST",
	GET_PROFILE_SUCCESS = "GET_PROFILE_SUCCESS",
	GET_PROFILE_FAILURE = "GET_PROFILE_FAILURE",

	SAVE_PROFILE_REQUEST = "SAVE_PROFILE_REQUEST",
	SAVE_PROFILE_SUCCESS = "SAVE_PROFILE_SUCCESS",
	SAVE_PROFILE_FAILURE = "SAVE_PROFILE_FAILURE",

	SAVE_PROFILE_ADDRESS_REQUEST = "SAVE_PROFILE_ADDRESS_REQUEST",
	SAVE_PROFILE_ADDRESS_SUCCESS = "SAVE_PROFILE_ADDRESS_SUCCESS",
	SAVE_PROFILE_ADDRESS_FAILURE = "SAVE_PROFILE_ADDRESS_FAILURE",

	GET_HEADER_INFO_REQUEST = "GET_HEADER_INFO_REQUEST",
	GET_HEADER_INFO_SUCCESS = "GET_HEADER_INFO_SUCCESS",
	GET_HEADER_INFO_FAILURE = "GET_HEADER_INFO_FAILURE",

	GET_ACCOUNT_REQUEST = "GET_ACCOUNT_REQUEST",
	GET_ACCOUNT_SUCCESS = "GET_ACCOUNT_SUCCESS",
	GET_ACCOUNT_FAILURE = "GET_ACCOUNT_FAILURE",

	GET_OPERATION_HISTORY_BY_ACCOUNT_REQUEST = "GET_OPERATION_HISTORY_BY_ACCOUNT_REQUEST",
	GET_OPERATION_HISTORY_BY_ACCOUNT_SUCCESS = "GET_OPERATION_HISTORY_BY_ACCOUNT_SUCCESS",
	GET_OPERATION_HISTORY_BY_ACCOUNT_FAILURE = "GET_OPERATION_HISTORY_BY_ACCOUNT_FAILURE",
}

export interface GetProfileRequestAction {
	type: UserActionsTypes.GET_PROFILE_REQUEST;
}

export interface GetProfileSuccessAction {
	type: UserActionsTypes.GET_PROFILE_SUCCESS;
	payload: IUserProfile;
}

export interface GetProfileFailureAction {
	type: UserActionsTypes.GET_PROFILE_FAILURE;
	payload: string;
}

export interface SaveProfileRequestAction {
	type: UserActionsTypes.SAVE_PROFILE_REQUEST;
}

export interface SaveProfileSuccessAction {
	type: UserActionsTypes.SAVE_PROFILE_SUCCESS;
}

export interface SaveProfileFailureAction {
	type: UserActionsTypes.SAVE_PROFILE_FAILURE;
	payload: string;
}

export interface SaveProfileAddressRequestAction {
	type: UserActionsTypes.SAVE_PROFILE_ADDRESS_REQUEST;
}

export interface SaveProfileAddressSuccessAction {
	type: UserActionsTypes.SAVE_PROFILE_ADDRESS_SUCCESS;
}

export interface SaveProfileAddressFailureAction {
	type: UserActionsTypes.SAVE_PROFILE_ADDRESS_FAILURE;
	payload: string;
}

export interface GetHeaderInfoRequestAction {
	type: UserActionsTypes.GET_HEADER_INFO_REQUEST;
}

export interface GetHeaderInfoSuccessAction {
	type: UserActionsTypes.GET_HEADER_INFO_SUCCESS;
	payload: IHeaderInfo;
}

export interface GetHeaderInfoFailureAction {
	type: UserActionsTypes.GET_HEADER_INFO_FAILURE;
	payload: string;
}

export interface GetOperationHistoryRequestAction {
	type: UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_REQUEST;
}

export interface GetOperationHistorySuccessAction {
	type: UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_SUCCESS;
	payload: IOperationHistory;
}

export interface GetOperationHistoryFailureAction {
	type: UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_FAILURE;
	payload: string;
}

export interface GetAccountRequestAction {
	type: UserActionsTypes.GET_ACCOUNT_REQUEST;
}

export interface GetAccountSuccessAction {
	type: UserActionsTypes.GET_ACCOUNT_SUCCESS;
	payload: {
		account: IAccount;
		payLink: string;
	};
}

export interface GetAccountFailureAction {
	type: UserActionsTypes.GET_ACCOUNT_FAILURE;
	payload: string;
}

export type UserAction =
	| GetProfileRequestAction
	| GetProfileSuccessAction
	| GetProfileFailureAction
	| SaveProfileRequestAction
	| SaveProfileSuccessAction
	| SaveProfileFailureAction
	| SaveProfileAddressRequestAction
	| SaveProfileAddressSuccessAction
	| SaveProfileAddressFailureAction
	| GetHeaderInfoRequestAction
	| GetHeaderInfoSuccessAction
	| GetHeaderInfoFailureAction
	| GetOperationHistoryRequestAction
	| GetOperationHistorySuccessAction
	| GetOperationHistoryFailureAction
	| GetAccountRequestAction
	| GetAccountSuccessAction
	| GetAccountFailureAction;
