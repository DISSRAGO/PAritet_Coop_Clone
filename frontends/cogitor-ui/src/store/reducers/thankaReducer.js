import { ThankaActionCreators } from "../actions/thanka-actions";
import {getThankaDataRequest, getThankaDataSuccess, getThankaDataFailure} from "../types/thanka-types";
import {getTableDataRequest, getTableDataSuccess, getTableDataFailure} from "../types/thanka-types";
import {getTableStateRequest, getTableStateSuccess, getTableStateFailure} from "../types/thanka-types";
import {getThankaPreviewRequest, getThankaPreviewSuccess, getThankaPreviewFailure} from "../types/thanka-types";
import {getVersionRequest, getVersionSuccess, getVersionFailure} from "../types/thanka-types";
import {FetchStatus} from "../types/fetchTypes"

const initialState = {
    Data: {
        status: FetchStatus.IDLE,
        data: null,
        error: null,
    },
    Preview: {
        status: FetchStatus.IDLE,
        data: null,
        error: null,
    },
    TableState: {
        status: FetchStatus.IDLE,
        data: "unvisible",
        error: null,
    },
    TableData: {
        status: FetchStatus.IDLE,
        data: null,
        error: null,
    },
    Version: {
        status: FetchStatus.IDLE,
        data: null,
        error: null,
    },
};

export default function ThankaReducer(state = initialState, action = ThankaActionCreators) {
	switch (action.type) {
        //all thankadata
		case getThankaDataRequest: 
			return {
				...state,
				Data: {
                    status: FetchStatus.IDLE,
                    data: null,
                    error: null,
                },
			};
		case getThankaDataSuccess:
			return {
				...state,
                Data: {
                    status: FetchStatus.SUCCESS,
                    data: action.payload,
                    error: null,
                },
			};
		case getThankaDataFailure:
			return {
				...state,
                Data: {
                    status: FetchStatus.IDLE,
                    data: null,
                    error: action.payload,
                },
			};
        //preview
        case getThankaPreviewRequest: 
			return {
				...state,
				Preview: {
                    status: FetchStatus.IDLE,
                    data: null,
                    error: null,
                },
			};
		case getThankaPreviewSuccess:
			return {
				...state,
                Preview: {
                    status: FetchStatus.SUCCESS,
                    data: action.payload,
                    error: null,
                },
			};
		case getThankaPreviewFailure:
			return {
				...state,
                Preview: {
                    status: FetchStatus.IDLE,
                    data: null,
                    error: null,
                },
			};
        //Table
        case getTableStateRequest: 
			return {
				...state,
				TableState: {
                    status: FetchStatus.IDLE,
                    data: "unvisible",
                    error: null,
                },
			};
		case getTableStateSuccess:
			return {
				...state,
                TableState: {
                    status: FetchStatus.SUCCESS,
                    data: action.payload,
                    error: null,
                },
			};
		case getTableStateFailure:
			return {
				...state,
                TableState: {
                    status: FetchStatus.IDLE,
                    data: "unvisible",
                    error: null,
                },
			};
        case getTableDataRequest: 
			return {
				...state,
				TableData: {
                    status: FetchStatus.IDLE,
                    data: null,
                    error: null,
                },
			};
		case getTableDataSuccess:
			return {
				...state,
                TableData: {
                    status: FetchStatus.SUCCESS,
                    data: action.payload,
                    error: null,
                },
			};
		case getTableDataFailure:
			return {
				...state,
                TableData: {
                    status: FetchStatus.IDLE,
                    data: null,
                    error: null,
                },
			};

        case getVersionRequest: 
			return {
				...state,
				Version: {
                    status: FetchStatus.IDLE,
                    data: null,
                    error: null,
                },
			};

		case getVersionSuccess:
			return {
				...state,
                Version: {
                    status: FetchStatus.SUCCESS,
                    data: action.payload,
                    error: null,
                },
			};
        case getVersionFailure:
            return {
                ...state,
                Version: {
                    status: FetchStatus.IDLE,
                    data: null,
                    error: null,
                },
            };
        default:
			return state;
    }
}
