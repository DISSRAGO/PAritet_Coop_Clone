import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {GetCountriesListResult, GetRegionsListOptions, GetRegionsListResult} from "./AddressApi";
import {ThankaDataType, getFakeThankaData} from "../mocks/thanka_data";

// ${process.env['NX_API_URL']}
export const thankaApi = createApi({
  reducerPath: "thankaApi",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/thanka` }),
  endpoints: (build) => ({
    getCountriesList: build.query<GetCountriesListResult, void>({
      query: () => ({
        url: `/countries`,
        method: "GET",
      }),
    }),
  }),
});

// Реэкспорт моков, чтобы существующий код мог импортировать из services/ThankaApi
export type { ThankaDataType };
export { getFakeThankaData };