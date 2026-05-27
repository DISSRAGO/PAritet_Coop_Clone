import {FetchStatus} from "../types/fetchTypes";
import {
	PaymentAction,
	PaymentActionEnum,
	PaymentState,
} from "../types/payment-types";

const initialState: PaymentState = {
	activationCodeStatus: {
		status: FetchStatus.IDLE,
		data: {
			ActivationCode: "",
			ActivationRequestId: "",
			OperationId: "",
		},
		error: null,
	},
	paymentStatus: {
		status: FetchStatus.IDLE,
		error: null,
	},
	paymentOptions: {
		status: FetchStatus.IDLE,
		data: {contractFrom: [], typeTo: []},
		error: null,
	},
};

export default function paymentReducer(
	state = initialState,
	action: PaymentAction,
): PaymentState {
	switch (action.type) {
		case PaymentActionEnum.GET_PAYMENT_OPTIONS_REQUEST:
			return {
				...state,
				paymentOptions: {
					status: FetchStatus.IDLE,
					data: {contractFrom: [], typeTo: []},
					error: null,
				},
			};
		case PaymentActionEnum.GET_PAYMENT_OPTIONS_SUCCESS:
			return {
				...state,
				paymentOptions: {
					status: FetchStatus.IDLE,
					data: action.payload,
					error: null,
				},
			};
		case PaymentActionEnum.GET_PAYMENT_OPTIONS_FAILURE:
			return {
				...state,
				paymentOptions: {
					status: FetchStatus.IDLE,
					data: {contractFrom: [], typeTo: []},
					error: action.payload,
				},
			};
		case PaymentActionEnum.ACTIVATION_CODE_REQUEST:
			return {
				...state,
				activationCodeStatus: {
					status: FetchStatus.LOADING,
					data: {
						ActivationCode: "",
						ActivationRequestId: "",
						OperationId: "",
					},
					error: null,
				},
			};
		case PaymentActionEnum.ACTIVATION_CODE_SUCCESS:
			return {
				...state,
				activationCodeStatus: {
					status: FetchStatus.SUCCESS,
					data: action.payload,
					error: null,
				},
			};
		case PaymentActionEnum.ACTIVATION_CODE_FAILURE:
			return {
				...state,
				activationCodeStatus: {
					status: FetchStatus.FAIL,
					data: {
						ActivationCode: "",
						ActivationRequestId: "",
						OperationId: "",
					},
					error: action.payload,
				},
			};
		case PaymentActionEnum.PAYMENT_REQUEST:
			return {
				...state,
				paymentStatus: {
					status: FetchStatus.LOADING,
					error: null,
				},
			};
		case PaymentActionEnum.PAYMENT_SUCCESS:
			return {
				...state,
				paymentStatus: {
					status: FetchStatus.SUCCESS,
					error: null,
				},
			};
		case PaymentActionEnum.PAYMENT_FAILURE:
			return {
				...state,
				paymentStatus: {
					status: FetchStatus.FAIL,
					error: action.payload,
				},
			};
		default:
			return state;
	}
}
