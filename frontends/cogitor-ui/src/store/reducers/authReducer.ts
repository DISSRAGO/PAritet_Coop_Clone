import {IUser} from "../../models/profile/IUser";
import {checkAuth} from "../../utils/checkAuth";
import {AuthAction, AuthActionEnum, AuthState} from "../types/auth-types";
import {FetchStatus} from "../types/fetchTypes";

const initialState: AuthState = {
	isAuth: checkAuth(),
	user: {} as IUser,
	logoutRequestStatus: {
		status: FetchStatus.IDLE,
		error: null,
	},
	signInRequestStatus: {
		status: FetchStatus.IDLE,
		error: null,
	},
	signUpRequestStatus: {
		status: FetchStatus.IDLE,
		data: {},
		error: null,
	},
	confirmRequestStatus: {
		status: FetchStatus.IDLE,
		error: null,
	},
	validateLoginRequestStatus: {
		status: FetchStatus.IDLE,
		error: null,
	},
	validateEmailRequestStatus: {
		status: FetchStatus.IDLE,
		error: null,
	},
	validatePhoneRequestStatus: {
		status: FetchStatus.IDLE,
		error: null,
	},
};

export default function authReducer(
	state = initialState,
	action: AuthAction,
): AuthState {
	switch (action.type) {
		case AuthActionEnum.LOGIN_REQUEST:
			return {
				...state,
				signInRequestStatus: {
					status: FetchStatus.LOADING,
					error: null,
				},
			};
		case AuthActionEnum.LOGIN_SUCCESS:
			return {
				...state,
				signInRequestStatus: {
					status: FetchStatus.SUCCESS,
					error: null,
				},
			};
		case AuthActionEnum.LOGIN_FAILURE:
			return {
				...state,
				signInRequestStatus: {
					status: FetchStatus.FAIL,
					error: action.payload,
				},
			};
		case AuthActionEnum.LOGOUT_REQUEST:
			return {
				...state,
				logoutRequestStatus: {
					status: FetchStatus.LOADING,
					error: null,
				},
			};
		case AuthActionEnum.LOGOUT_SUCCESS:
			return {
				...state,
				logoutRequestStatus: {
					status: FetchStatus.SUCCESS,
					error: null,
				},
			};
		case AuthActionEnum.LOGOUT_FAILURE:
			return {
				...state,
				logoutRequestStatus: {
					status: FetchStatus.FAIL,
					error: action.payload,
				},
			};
		case AuthActionEnum.SIGN_UP_REQUEST:
			return {
				...state,
				signUpRequestStatus: {
					status: FetchStatus.LOADING,
					data: {},
					error: null,
				},
			};
		case AuthActionEnum.SIGN_UP_SUCCESS:
			return {
				...state,
				signUpRequestStatus: {
					status: FetchStatus.SUCCESS,
					data: action.payload,
					error: null,
				},
			};
		case AuthActionEnum.SIGN_UP_FAILURE:
			return {
				...state,
				signUpRequestStatus: {
					status: FetchStatus.FAIL,
					data: {},
					error: action.payload,
				},
			};
		case AuthActionEnum.CONFIRM_SIGN_UP_REQUEST:
			return {
				...state,
				confirmRequestStatus: {
					status: FetchStatus.LOADING,
					error: null,
				},
			};
		case AuthActionEnum.CONFIRM_SIGN_UP_SUCCESS:
			return {
				...state,
				confirmRequestStatus: {
					status: FetchStatus.SUCCESS,
					error: null,
				},
			};
		case AuthActionEnum.CONFIRM_SIGN_UP_FAILURE:
			return {
				...state,
				confirmRequestStatus: {
					status: FetchStatus.FAIL,
					error: action.payload,
				},
			};
		case AuthActionEnum.VALIDATE_PHONE_REQUEST:
			return {
				...state,
				validatePhoneRequestStatus: {
					status: FetchStatus.LOADING,
					error: null,
				},
			};
		case AuthActionEnum.VALIDATE_PHONE_SUCCESS:
			return {
				...state,
				validatePhoneRequestStatus: {
					status: FetchStatus.SUCCESS,
					error: null,
				},
			};
		case AuthActionEnum.VALIDATE_PHONE_FAILURE:
			return {
				...state,
				validatePhoneRequestStatus: {
					status: FetchStatus.FAIL,
					error: action.payload,
				},
			};
		case AuthActionEnum.VALIDATE_EMAIL_REQUEST:
			return {
				...state,
				validateEmailRequestStatus: {
					status: FetchStatus.LOADING,
					error: null,
				},
			};
		case AuthActionEnum.VALIDATE_EMAIL_SUCCESS:
			return {
				...state,
				validateEmailRequestStatus: {
					status: FetchStatus.SUCCESS,
					error: null,
				},
			};
		case AuthActionEnum.VALIDATE_EMAIL_FAILURE:
			return {
				...state,
				validateEmailRequestStatus: {
					status: FetchStatus.FAIL,
					error: action.payload,
				},
			};
		case AuthActionEnum.VALIDATE_LOGIN_REQUEST:
			return {
				...state,
				validateLoginRequestStatus: {
					status: FetchStatus.LOADING,
					error: null,
				},
			};
		case AuthActionEnum.VALIDATE_LOGIN_SUCCESS:
			return {
				...state,
				validateLoginRequestStatus: {
					status: FetchStatus.SUCCESS,
					error: null,
				},
			};
		case AuthActionEnum.VALIDATE_LOGIN_FAILURE:
			return {
				...state,
				validateLoginRequestStatus: {
					status: FetchStatus.FAIL,
					error: action.payload,
				},
			};
		default:
			return state;
	}
}
