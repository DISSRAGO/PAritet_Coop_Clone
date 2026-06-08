import {IHeaderInfo} from "../models/profile/IHeaderInfo";
import {IUserProfile} from "../models/profile/IUserProfile";
import {fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {createApi} from "@reduxjs/toolkit/query/react";
import {IAccount} from "../models/profile/IAccount";
import {IOperationHistory} from "../models/profile/IOperationHistory";
export type OperationHistoryOptions = {
  accountId: string;
  dateBegin: string;
  dateEnd: string;
}


export const userApi = createApi({
	reducerPath: "userApi",
	// same-origin: все запросы /api/user/* уходят на тот же origin что и страница
	// (dev: webpack proxy → :8000; prod: reverse-proxy → :3001 → webpack proxy → :8000).
	// Раньше было http://localhost:3000/api/user — это вообще неправильный порт
	// (ни dev :3001, ни backend :8000) — эти запросы никуда не ходили.
	baseQuery: fetchBaseQuery({baseUrl: `/api/user`}),
	endpoints: (build) => {
		return ({
			getProfile: build.query<IUserProfile, void>({
				query: () => {
					return {
						url: "/profile",
						method: "GET",
						headers: {
							Authorization:
								"Bearer " + localStorage.getItem("accessToken"),
						},
					};
				},
			}),
			saveProfile: build.query<string, IUserProfile>({
				query: () => {
					return {
						url: "/profile",
						method: "GET",
						headers: {
							Authorization:
								"Bearer " + localStorage.getItem("accessToken"),
						},
					};
				},
			}),

			saveProfileAddress: build.query<string, IUserProfile>({
				query: () => {
					return {
						url: "/profile/address",
						method: "POST",
						headers: {
							Authorization:
								"Bearer " + localStorage.getItem("accessToken"),
						},
					};
				},
			}),
			getAccount: build.query<IAccount, void>({
				query: () => {
					return {
						url: "/account",
						method: "GET",
						headers: {
							Authorization:
								"Bearer " + localStorage.getItem("accessToken"),
						},
					};
				},
			}),
			getOperationHistory: build.query<IOperationHistory, OperationHistoryOptions>({
				query: ({accountId, dateBegin, dateEnd}) => {
					console.log(accountId, dateBegin, dateEnd);
					return {
						url: `/operation_history?accountId=${accountId}&dateBegin=${dateBegin}&dateEnd=${dateEnd}`,
						method: "GET",
						headers: {
							Authorization:
								"Bearer " + localStorage.getItem("accessToken"),
						},
					};
				},
			}),
			getHeaderInformation: build.query<IHeaderInfo, void>({
				query: () => {
					return {
						url: "/header_info",
						method: "GET",
						headers: {
							Authorization:
								"Bearer " + localStorage.getItem("accessToken"),
						},
					};
				},
			}),
		});
	},
});

export const {
	useGetProfileQuery,
	useLazyGetHeaderInformationQuery,
	useGetAccountQuery,
  useLazyGetOperationHistoryQuery,
} = userApi;
