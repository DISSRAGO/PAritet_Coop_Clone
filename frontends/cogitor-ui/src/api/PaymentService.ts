import {IPayConfirm} from "../models/payment/IPayConfirm";
import {IPaymentOption} from "../models/payment/IPaymentOption";
import {getAccessToken} from "../utils/checkAuth";
import {Urls} from "../utils/urls";

export default class PaymentService {
	static async pay_step1(): Promise<IPaymentOption> {
		return fetch(Urls.PAYMENT_STEP1_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + getAccessToken(),
			},
		}).then((response) => {
			if (response.ok) {
				return Promise.resolve(response.json());
			} else {
				return Promise.reject(response.json());
			}
		});
	}
	static async pay_step2(
		amount: string,
		description: string,
		login: string,
	): Promise<IPayConfirm> {
		return fetch(Urls.PAYMENT_STEP2_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + getAccessToken(),
			},
			body: JSON.stringify({
				amount: amount,
				description: description,
				login: login,
			}),
		}).then((response) => {
			if (response.ok) {
				return Promise.resolve(response.json());
			} else {
				return Promise.reject(response.json());
			}
		});
	}
	static async pay_step3(
		activationRequestId: string,
		activationCode: string,
		contractForm: string,
		amount: string,
		typeTo: string,
		valueTo: string,
		description: string,
	): Promise<string> {
		return fetch(Urls.PAYMENT_STEP3_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Access-Token": getAccessToken(),
			},
			body: JSON.stringify({
				activationRequestId: activationRequestId,
				activationCode: activationCode,
				contractForm: contractForm,
				amount: amount,
				typeTo: typeTo,
				valueTo: valueTo,
				description: description,
			}),
		}).then((response) => {
			if (response.ok) {
				return Promise.resolve(response.text());
			} else {
				return Promise.reject(response.text());
			}
		});
	}
}
