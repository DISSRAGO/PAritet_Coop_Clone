import {createApi} from "@reduxjs/toolkit/dist/query/react";
import {fetchBaseQuery} from "@reduxjs/toolkit/query/react";


export type GetLoginOptions = {
	login: string;
	password: string;
};
export type GetLoginResult = {
	accessToken: string;
	refreshToken: string;
};


export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: fetchBaseQuery({baseUrl: `/api/auth`}),
	endpoints: (build) => ({
		loginToAccount: build.mutation<
			GetLoginResult,
			Partial<GetLoginOptions>
		>({
			query({login, password}) {
				return {
					url: `/login?login=${login}&password=${password}`,
					method: "POST",
				};
			},
		}),
		logoutFromAccount: build.mutation<string, void>({
			query() {
				return {
					url: "/logout",
					method: "POST",
					headers: {
						Authorization:
							"Bearer " + localStorage.getItem("accessToken"),
					},
				};
			},
		}),
	}),
});

export const {useLoginToAccountMutation, useLogoutFromAccountMutation} =
	authApi;
