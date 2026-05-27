import {PayConfirm} from "../../models/PayConfirm";
import {PaymentOption} from "../../models/PaymentOption";
import {FetchStatus} from "./fetchTypes";

export interface PaymentState {
	paymentOptions: {
		status: FetchStatus;
		data: PaymentOption;
		error: string | null;
	};
	activationCodeStatus: {
		status: FetchStatus;
		data: PayConfirm;
		error: string | null;
	};
	paymentStatus: {
		status: FetchStatus;
		error: string | null;
	};
}

export enum PaymentActionEnum {
	GET_PAYMENT_OPTIONS_REQUEST = "GET_PAYMENT_OPTIONS_REQUEST",
	GET_PAYMENT_OPTIONS_SUCCESS = "GET_PAYMENT_OPTIONS_SUCCESS",
	GET_PAYMENT_OPTIONS_FAILURE = "GET_PAYMENT_OPTIONS_FAILURE",
	ACTIVATION_CODE_REQUEST = "ACTIVATION_CODE_REQUEST",
	ACTIVATION_CODE_SUCCESS = "ACTIVATION_CODE_SUCCESS",
	ACTIVATION_CODE_FAILURE = "ACTIVATION_CODE_FAILURE",
	PAYMENT_REQUEST = "PAYMENT_REQUEST",
	PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
	PAYMENT_FAILURE = "PAYMENT_FAILURE",
}

export interface GetPaymentOptionsRequestAction {
	type: PaymentActionEnum.GET_PAYMENT_OPTIONS_REQUEST;
}

export interface GetPaymentOptionsSuccessAction {
	type: PaymentActionEnum.GET_PAYMENT_OPTIONS_SUCCESS;
	payload: PaymentOption;
}

export interface GetPaymentOptionsFailureAction {
	type: PaymentActionEnum.GET_PAYMENT_OPTIONS_FAILURE;
	payload: string;
}

export interface ActivationCodeRequestAction {
	type: PaymentActionEnum.ACTIVATION_CODE_REQUEST;
}

export interface ActivationCodeSuccessAction {
	type: PaymentActionEnum.ACTIVATION_CODE_SUCCESS;
	payload: PayConfirm;
}

export interface ActivationCodeFailureAction {
	type: PaymentActionEnum.ACTIVATION_CODE_FAILURE;
	payload: string;
}

export interface PaymentRequestAction {
	type: PaymentActionEnum.PAYMENT_REQUEST;
}

export interface PaymentSuccessAction {
	type: PaymentActionEnum.PAYMENT_SUCCESS;
}

export interface PaymentFailureAction {
	type: PaymentActionEnum.PAYMENT_FAILURE;
	payload: string;
}

export type PaymentAction =
	| GetPaymentOptionsRequestAction
	| GetPaymentOptionsSuccessAction
	| GetPaymentOptionsFailureAction
	| ActivationCodeRequestAction
	| ActivationCodeSuccessAction
	| ActivationCodeFailureAction
	| PaymentRequestAction
	| PaymentSuccessAction
	| PaymentFailureAction;
