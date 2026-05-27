import {Dispatch} from "react";

import PaymentService from "../../api/PaymentService";
import {AppDispatch} from "../index";
import {PaymentActionEnum} from "../types/payment-types";
import { ServerError } from "../../models/IServerError";

export const PaymentActionCreators = {
	pay_step1: (): Dispatch<AppDispatch> => async (dispatch: AppDispatch) => {
		dispatch({type: PaymentActionEnum.GET_PAYMENT_OPTIONS_REQUEST});
		PaymentService.pay_step1()
			.then((data) => {
				dispatch({
					type: PaymentActionEnum.GET_PAYMENT_OPTIONS_SUCCESS,
					payload: data,
				});
			})
			.catch((error) => {
				console.log(error);
				error.json().then((e: ServerError) => {
					dispatch({
						type: PaymentActionEnum.PAYMENT_FAILURE,
						payload: e.text,
					});
				});
			});
	},
	pay_step2:
		(
			amount: string,
			description: string,
			login: string,
		): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({type: PaymentActionEnum.ACTIVATION_CODE_REQUEST});
			PaymentService.pay_step2(amount, description, login)
				.then((data) => {
					console.log(data);
					dispatch({
						type: PaymentActionEnum.ACTIVATION_CODE_SUCCESS,
						payload: data,
					});
				})
				.catch((error) => {
					console.log(error);
					error.json().then((e: ServerError) => {
						dispatch({
							type: PaymentActionEnum.ACTIVATION_CODE_FAILURE,
							payload: e.text,
						});
					});
				});
		},
	pay_step3:
		(
			activationRequestId: string,
			activationCode: string,
			contractForm: string,
			amount: string,
			typeTo: string,
			valueTo: string,
			description: string,
		): Dispatch<AppDispatch> =>
		async (dispatch: AppDispatch) => {
			dispatch({type: PaymentActionEnum.PAYMENT_REQUEST});
			PaymentService.pay_step3(
				activationRequestId,
				activationCode,
				contractForm,
				amount,
				typeTo,
				valueTo,
				description,
			)
				.then((data) => {
					console.log(data);
					dispatch({type: PaymentActionEnum.PAYMENT_SUCCESS});
				})
				.catch((error) => {
					console.log(error);
					error.json().then((e: ServerError) => {
						dispatch({
							type: PaymentActionEnum.PAYMENT_FAILURE,
							payload: e.text,
						});
					});
				});
		},
};
