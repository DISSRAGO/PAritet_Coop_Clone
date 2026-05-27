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
	baseQuery: fetchBaseQuery({baseUrl: `http://localhost:3000/api/user`}),
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
