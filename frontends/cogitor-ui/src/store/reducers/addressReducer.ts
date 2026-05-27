import {
	AddressAction,
	AddressActionEnum,
	AddressState,
} from "../types/address-types";
import {FetchStatus} from "../types/fetchTypes";

const initialState: AddressState = {
	countries: {
		status: FetchStatus.IDLE,
		data: [],
		error: null,
	},
	regions: {
		status: FetchStatus.IDLE,
		data: [],
		error: null,
	},
	cities: {
		status: FetchStatus.IDLE,
		data: [],
		error: null,
	},
	streets: {
		status: FetchStatus.IDLE,
		data: [],
		error: null,
	},
	houses: {
		status: FetchStatus.IDLE,
		data: [],
		error: null,
	},
	flats: {
		status: FetchStatus.IDLE,
		data: [],
		error: null,
	},
	addressId: {
		status: FetchStatus.IDLE,
		data: -1,
		error: null,
	},
};

export default function addressReducer(
	state = initialState,
	action: AddressAction,
): AddressState {
	switch (action.type) {
		case AddressActionEnum.GET_COUNTRY_REQUEST:
			return {
				...state,
				countries: {
					status: FetchStatus.LOADING,
					data: [],
					error: null,
				},
				regions: {
					status: FetchStatus.IDLE,
					data: [],
					error: null,
				},
				cities: {
					status: FetchStatus.IDLE,
					data: [],
					error: null,
				},
				streets: {
					status: FetchStatus.IDLE,
					data: [],
					error: null,
				},
				houses: {
					status: FetchStatus.IDLE,
					data: [],
					error: null,
				},
			};
		case AddressActionEnum.GET_COUNTRY_SUCCESS:
			return {
				...state,
				countries: {
					status: FetchStatus.SUCCESS,
					data: action.payload,
					error: null,
				},
			};
		case AddressActionEnum.GET_COUNTRY_FAILURE:
			return {
				...state,
				countries: {
					status: FetchStatus.FAIL,
					data: [],
					error: action.payload,
				},
			};
		case AddressActionEnum.GET_REGION_REQUEST:
			return {
				...state,
				regions: {
					status: FetchStatus.LOADING,
					data: [],
					error: null,
				},
				cities: {
					status: FetchStatus.IDLE,
					data: [],
					error: null,
				},
				streets: {
					status: FetchStatus.IDLE,
					data: [],
					error: null,
				},
				houses: {
					status: FetchStatus.IDLE,
					data: [],
					error: null,
				},
			};
		case AddressActionEnum.GET_REGION_SUCCESS:
			return {
				...state,
				regions: {
					status: FetchStatus.SUCCESS,
					data: action.payload,
					error: null,
				},
			};
		case AddressActionEnum.GET_REGION_FAILURE:
			return {
				...state,
				regions: {
					status: FetchStatus.FAIL,
					data: [],
					error: action.payload,
				},
			};
		case AddressActionEnum.GET_CITY_REQUEST:
			return {
				...state,
				cities: {
					status: FetchStatus.LOADING,
					data: [],
					error: null,
				},
				streets: {
					status: FetchStatus.IDLE,
					data: [],
					error: null,
				},
				houses: {
					status: FetchStatus.IDLE,
					data: [],
					error: null,
				},
			};
		case AddressActionEnum.GET_CITY_SUCCESS:
			return {
				...state,
				cities: {
					status: FetchStatus.SUCCESS,
					data: action.payload,
					error: null,
				},
			};
		case AddressActionEnum.GET_CITY_FAILURE:
			return {
				...state,
				cities: {
					status: FetchStatus.FAIL,
					data: [],
					error: action.payload,
				},
			};
		case AddressActionEnum.GET_STREET_REQUEST:
			return {
				...state,
				streets: {
					status: FetchStatus.LOADING,
					data: [],
					error: null,
				},
				houses: {
					status: FetchStatus.IDLE,
					data: [],
					error: null,
				},
			};
		case AddressActionEnum.GET_STREET_SUCCESS:
			return {
				...state,
				streets: {
					status: FetchStatus.SUCCESS,
					data: action.payload,
					error: null,
				},
			};
		case AddressActionEnum.GET_STREET_FAILURE:
			return {
				...state,
				streets: {
					status: FetchStatus.FAIL,
					data: [],
					error: action.payload,
				},
			};
		case AddressActionEnum.GET_HOUSE_REQUEST:
			return {
				...state,
				houses: {
					status: FetchStatus.LOADING,
					data: [],
					error: null,
				},
			};
		case AddressActionEnum.GET_HOUSE_SUCCESS:
			return {
				...state,
				houses: {
					status: FetchStatus.SUCCESS,
					data: action.payload,
					error: null,
				},
			};
		case AddressActionEnum.GET_HOUSE_FAILURE:
			return {
				...state,
				houses: {
					status: FetchStatus.FAIL,
					data: [],
					error: action.payload,
				},
			};
		case AddressActionEnum.GET_FLAT_REQUEST:
			return {
				...state,
				houses: {
					status: FetchStatus.LOADING,
					data: [],
					error: null,
				},
			};
		case AddressActionEnum.GET_FLAT_SUCCESS:
			return {
				...state,
				houses: {
					status: FetchStatus.SUCCESS,
					data: action.payload,
					error: null,
				},
			};
		case AddressActionEnum.GET_FLAT_FAILURE:
			return {
				...state,
				houses: {
					status: FetchStatus.FAIL,
					data: [],
					error: action.payload,
				},
			};
		case AddressActionEnum.GET_ADDRESS_ID_REQUEST:
			return {
				...state,
				addressId: {
					status: FetchStatus.LOADING,
					data: -1,
					error: null,
				},
			};
		case AddressActionEnum.GET_ADDRESS_ID_SUCCESS:
			return {
				...state,
				addressId: {
					status: FetchStatus.LOADING,
					data: action.payload,
					error: null,
				},
			};
		case AddressActionEnum.GET_ADDRESS_ID_FAILURE:
			return {
				...state,
				addressId: {
					status: FetchStatus.FAIL,
					data: -1,
					error: action.payload,
				},
			};
		default:
			return state;
	}
}
