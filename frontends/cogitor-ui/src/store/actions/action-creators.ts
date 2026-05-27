import {AddressActionCreators} from "./address-action-creators";
import {AuthActionCreators} from "./auth-action-creators";
import {PaymentActionCreators} from "./payment-action-creators";
import {UserActionsCreators} from "./user-action-creators";
import {ThankaActionCreators} from "./thanka-actions";

export const allActionCreators = {
	...PaymentActionCreators,
	...AddressActionCreators,
	...AuthActionCreators,
	...UserActionsCreators,
	...ThankaActionCreators,
};
