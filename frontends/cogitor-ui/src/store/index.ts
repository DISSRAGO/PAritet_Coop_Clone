import {applyMiddleware, combineReducers, createStore} from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";

import reducers from "./reducers";

const rootReducer = combineReducers(reducers);

const middlewareList = [thunk/*, logger*/]

export const store = createStore(
	rootReducer,
	applyMiddleware(...middlewareList),
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
