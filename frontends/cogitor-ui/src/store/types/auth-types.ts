import {IConfirmFormData} from "../../models/profile/IConfirmFormData";
import {IUser} from "../../models/profile/IUser";
import {FetchStatus} from "./fetchTypes";

export interface AuthState {
	isAuth: boolean;
	user: IUser;
	logoutRequestStatus: {
		status: FetchStatus;
		error: string | null;
	};
	signInRequestStatus: {
		status: FetchStatus;
		error: string | null;
	};
	signUpRequestStatus: {
		status: FetchStatus;
		data: IConfirmFormData;
		error: string | null;
	};
	confirmRequestStatus: {
		status: FetchStatus;
		error: string | null;
	};
	validateLoginRequestStatus: {
		status: FetchStatus;
		error: string | null;
	};
	validateEmailRequestStatus: {
		status: FetchStatus;
		error: string | null;
	};
	validatePhoneRequestStatus: {
		status: FetchStatus;
		error: string | null;
	};
}

export enum AuthActionEnum {
	SIGN_UP_REQUEST = "SIGN_UP_REQUEST",
	SIGN_UP_SUCCESS = "SIGN_UP_SUCCESS",
	SIGN_UP_FAILURE = "SIGN_UP_FAILURE",

	CONFIRM_SIGN_UP_REQUEST = "CONFIRM_SIGN_UP_REQUEST",
	CONFIRM_SIGN_UP_SUCCESS = "CONFIRM_SIGN_UP_SUCCESS",
	CONFIRM_SIGN_UP_FAILURE = "CONFIRM_SIGN_UP_FAILURE",

	LOGIN_REQUEST = "LOGIN_REQUEST",
	LOGIN_SUCCESS = "LOGIN_SUCCESS",
	LOGIN_FAILURE = "LOGIN_FAILURE",

	LOGOUT_REQUEST = "LOGOUT_REQUEST",
	LOGOUT_SUCCESS = "LOGOUT_SUCCESS",
	LOGOUT_FAILURE = "LOGOUT_FAILURE",

	VALIDATE_EMAIL_REQUEST = "VALIDATE_EMAIL_REQUEST",
	VALIDATE_EMAIL_SUCCESS = "VALIDATE_EMAIL_SUCCESS",
	VALIDATE_EMAIL_FAILURE = "VALIDATE_EMAIL_FAILURE",

	VALIDATE_LOGIN_REQUEST = "VALIDATE_LOGIN_REQUEST",
	VALIDATE_LOGIN_SUCCESS = "VALIDATE_LOGIN_SUCCESS",
	VALIDATE_LOGIN_FAILURE = "VALIDATE_LOGIN_FAILURE",

	VALIDATE_PASSWORD_REQUEST = "VALIDATE_PASSWORD_REQUEST",
	VALIDATE_PASSWORD_SUCCESS = "VALIDATE_PASSWORD_SUCCESS",
	VALIDATE_PASSWORD_FAILURE = "VALIDATE_PASSWORD_FAILURE",

	VALIDATE_PHONE_REQUEST = "VALIDATE_PHONE_REQUEST",
	VALIDATE_PHONE_SUCCESS = "VALIDATE_PHONE_SUCCESS",
	VALIDATE_PHONE_FAILURE = "VALIDATE_PHONE_FAILURE",

	VALIDATE_RESTORE_PASSWORD_REQUEST = "VALIDATE_RESTORE_PASSWORD_REQUEST",
	VALIDATE_RESTORE_PASSWORD_SUCCESS = "VALIDATE_RESTORE_PASSWORD_SUCCESS",
	VALIDATE_RESTORE_PASSWORD_FAILURE = "VALIDATE_RESTORE_PASSWORD_FAILURE",
}

export interface SignUpRequestAction {
	type: AuthActionEnum.SIGN_UP_REQUEST;
}

export interface SignUpSuccessAction {
	type: AuthActionEnum.SIGN_UP_SUCCESS;
	payload: IConfirmFormData;
}

export interface SignUpFailureAction {
	type: AuthActionEnum.SIGN_UP_FAILURE;
	payload: string;
}

export interface ConfirmSignUpRequestAction {
	type: AuthActionEnum.CONFIRM_SIGN_UP_REQUEST;
}

export interface ConfirmSignUpSuccessAction {
	type: AuthActionEnum.CONFIRM_SIGN_UP_SUCCESS;
}

export interface ConfirmSignUpFailureAction {
	type: AuthActionEnum.CONFIRM_SIGN_UP_FAILURE;
	payload: string;
}

export interface LoginRequestAction {
	type: AuthActionEnum.LOGIN_REQUEST;
}

export interface LoginSuccessAction {
	type: AuthActionEnum.LOGIN_SUCCESS;
}

export interface LoginFailureAction {
	type: AuthActionEnum.LOGIN_FAILURE;
	payload: string;
}

export interface LogoutRequestAction {
	type: AuthActionEnum.LOGOUT_REQUEST;
}

export interface LogoutSuccessAction {
	type: AuthActionEnum.LOGOUT_SUCCESS;
}

export interface LogoutFailureAction {
	type: AuthActionEnum.LOGOUT_FAILURE;
	payload: string;
}

export interface ValidateEmailRequestAction {
	type: AuthActionEnum.VALIDATE_EMAIL_REQUEST;
}

export interface ValidateEmailSuccessAction {
	type: AuthActionEnum.VALIDATE_EMAIL_SUCCESS;
}

export interface ValidateEmailFailureAction {
	type: AuthActionEnum.VALIDATE_EMAIL_FAILURE;
	payload: string;
}

export interface ValidateLoginRequestAction {
	type: AuthActionEnum.VALIDATE_LOGIN_REQUEST;
}

export interface ValidateLoginSuccessAction {
	type: AuthActionEnum.VALIDATE_LOGIN_SUCCESS;
}

export interface ValidateLoginFailureAction {
	type: AuthActionEnum.VALIDATE_LOGIN_FAILURE;
	payload: string;
}

export interface ValidatePhoneRequestAction {
	type: AuthActionEnum.VALIDATE_PHONE_REQUEST;
}

export interface ValidatePhoneSuccessAction {
	type: AuthActionEnum.VALIDATE_PHONE_SUCCESS;
}

export interface ValidatePhoneFailureAction {
	type: AuthActionEnum.VALIDATE_PHONE_FAILURE;
	payload: string;
}
export type AuthAction =
	| SignUpRequestAction
	| SignUpSuccessAction
	| SignUpFailureAction
	| ConfirmSignUpRequestAction
	| ConfirmSignUpSuccessAction
	| ConfirmSignUpFailureAction
	| LoginRequestAction
	| LoginSuccessAction
	| LoginFailureAction
	| LogoutRequestAction
	| LogoutSuccessAction
	| LogoutFailureAction
	| ValidateEmailRequestAction
	| ValidateEmailSuccessAction
	| ValidateEmailFailureAction
	| ValidatePhoneRequestAction
	| ValidatePhoneSuccessAction
	| ValidatePhoneFailureAction
	| ValidateLoginRequestAction
	| ValidateLoginSuccessAction
	| ValidateLoginFailureAction;
