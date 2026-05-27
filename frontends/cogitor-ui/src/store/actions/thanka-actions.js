import {Dispatch} from "react";
import ThankaSevice from "../../api/ThankaService";
import {getThankaDataRequest, getThankaDataSuccess, getThankaDataFailure} from "../types/thanka-types";
import {getThankaPreviewRequest, getThankaPreviewSuccess, getThankaPreviewFailure} from "../types/thanka-types";
import {getTableDataRequest, getTableDataSuccess, getTableDataFailure} from "../types/thanka-types";
import {getTableStateRequest, getTableStateSuccess, getTableStateFailure} from "../types/thanka-types";
import {getVersionRequest, getVersionSuccess, getVersionFailure} from "../types/thanka-types";

export const ThankaActionCreators = {
	getData: (PATH, address, auth) => async (dispatch) => {
		dispatch({type: getThankaDataRequest});
		ThankaSevice.getData(PATH, address, auth)
			.then((result) => {
				dispatch({
					type: getThankaDataSuccess,
					payload: result,
				});
			})
			.catch((error) => {
				dispatch({
					type: getThankaDataFailure,
					payload: 'error',
				});
			});
	},

	getPreview: (Id, Name, Desc, isPic) => async (dispatch) => {
		dispatch({type: getThankaPreviewRequest});
		ThankaSevice.getPreview(Id, Name, Desc, isPic)
		.then((result) => {
			dispatch({
				type: getThankaPreviewSuccess,
				payload: result,
			});
		})
		.catch((error) => {
			dispatch({
				type: getThankaPreviewFailure,
				payload: null,
			});
		});
	},

	getTableState: (state) => async (dispatch) => {
		dispatch({type: getTableStateRequest});
		ThankaSevice.getTableState(state)
		.then((result) => {
			dispatch({
				type: getTableStateSuccess,
				payload: result,
			});
		})
		.catch((error) => {
			dispatch({
				type: getTableStateFailure,
				payload: null,
			});
		});
	},

	getTableData: (list) => async (dispatch) => {
		dispatch({type: getTableDataRequest});
		ThankaSevice.getTableData(list)
		.then((result) => {
			dispatch({
				type: getTableDataSuccess,
				payload: result,
			});
		})
		.catch((error) => {
			dispatch({
				type: getTableDataFailure,
				payload: null,
			});
		});
	},

	getVersion: (version) => async (dispatch) => {
		dispatch({type: getVersionRequest});
		ThankaSevice.getVersion(version)
		.then((result) => {
			dispatch({
				type: getVersionSuccess,
				payload: result,
			});
		})
		.catch((error) => {
			dispatch({
				type: getVersionFailure,
				payload: null,
			});
		});
	},

}
