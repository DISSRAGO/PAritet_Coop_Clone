import {FetchStatus} from "../types/fetchTypes";
import {UserAction, UserActionsTypes, UserState} from "../types/user-types";

const initialState: UserState = {
	userProfile: {
		status: FetchStatus.IDLE,
		data: {},
		error: null,
	},
	saveProfileStatus: {
		status: FetchStatus.IDLE,
		error: null,
	},
	saveProfileAddressStatus: {
		status: FetchStatus.IDLE,
		error: null,
	},
	headerInfo: {
		status: FetchStatus.IDLE,
		data: {},
		error: null,
	},
	account: {
		status: FetchStatus.IDLE,
		data: {},
		error: null,
	},
	operationHistory: {},
	payLink: "",
};

export default function UserReducer(
	state = initialState,
	action: UserAction,
): UserState {
	switch (action.type) {
		case UserActionsTypes.GET_ACCOUNT_REQUEST:
			return {
				...state,
				account: {
					status: FetchStatus.LOADING,
					data: {},
					error: null,
				},
			};
		case UserActionsTypes.GET_ACCOUNT_SUCCESS:
			return {
				...state,
				account: {
					status: FetchStatus.SUCCESS,
					data: action.payload.account,
					error: null,
				},
				payLink: action.payload.payLink,
			};
		case UserActionsTypes.GET_ACCOUNT_FAILURE:
			return {
				...state,
				account: {
					status: FetchStatus.FAIL,
					data: {},
					error: action.payload,
				},
			};
		case UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_REQUEST:
			return {
				...state,
			};
		case UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_SUCCESS:
			return {
				...state,
				operationHistory: action.payload,
			};
		case UserActionsTypes.GET_OPERATION_HISTORY_BY_ACCOUNT_FAILURE:
			return {
				...state,
			};
		case UserActionsTypes.GET_PROFILE_REQUEST:
			return {
				...state,
				userProfile: {
					status: FetchStatus.LOADING,
					data: {},
					error: null,
				},
			};
		case UserActionsTypes.GET_PROFILE_SUCCESS:
			return {
				...state,
				userProfile: {
					status: FetchStatus.SUCCESS,
					data: action.payload,
					error: null,
				},
			};
		case UserActionsTypes.GET_PROFILE_FAILURE:
			return {
				...state,
				userProfile: {
					status: FetchStatus.FAIL,
					data: {},
					error: action.payload,
				},
			};
		case UserActionsTypes.SAVE_PROFILE_REQUEST:
			return {
				...state,
				saveProfileStatus: {
					status: FetchStatus.LOADING,
					error: null,
				},
			};
		case UserActionsTypes.SAVE_PROFILE_SUCCESS:
			return {
				...state,
				saveProfileStatus: {
					status: FetchStatus.SUCCESS,
					error: null,
				},
			};
		case UserActionsTypes.SAVE_PROFILE_FAILURE:
			return {
				...state,
				saveProfileStatus: {
					status: FetchStatus.FAIL,
					error: action.payload,
				},
			};
		case UserActionsTypes.SAVE_PROFILE_ADDRESS_REQUEST:
			return {
				...state,
				saveProfileAddressStatus: {
					status: FetchStatus.LOADING,
					error: null,
				},
			};
		case UserActionsTypes.SAVE_PROFILE_ADDRESS_SUCCESS:
			return {
				...state,
				saveProfileAddressStatus: {
					status: FetchStatus.SUCCESS,
					error: null,
				},
			};
		case UserActionsTypes.SAVE_PROFILE_ADDRESS_FAILURE:
			return {
				...state,
				saveProfileAddressStatus: {
					status: FetchStatus.FAIL,
					error: action.payload,
				},
			};
		case UserActionsTypes.GET_HEADER_INFO_REQUEST:
			return {
				...state,
				headerInfo: {
					status: FetchStatus.LOADING,
					data: {},
					error: null,
				},
			};
		case UserActionsTypes.GET_HEADER_INFO_SUCCESS:
			return {
				...state,
				headerInfo: {
					status: FetchStatus.SUCCESS,
					data: action.payload,
					error: null,
				},
			};
		case UserActionsTypes.GET_HEADER_INFO_FAILURE:
			return {
				...state,
				headerInfo: {
					status: FetchStatus.FAIL,
					data: {},
					error: action.payload,
				},
			};
		default:
			return state;
	}
}
