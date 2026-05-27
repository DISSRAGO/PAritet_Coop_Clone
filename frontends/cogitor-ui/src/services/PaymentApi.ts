import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";


export type TypeTo ={
  name: string;
  value: string;
}

export type ContractFrom = {
  name: string;
  value: string;
}

export type PaymentTypesResult = {
  typeTo: Array<TypeTo>;
  contractFrom: Array<ContractFrom>;
}

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({baseUrl: `/api/payment`}),
  endpoints: (build) => ({
    paymentTypes: build.query<PaymentTypesResult, void>({
      query: () => {
        return {
          url: `/types`,
          method: "GET",
          headers: {
            Authorization:
              "Bearer " + localStorage.getItem("accessToken"),
          },
        };
      },
    }),
  })
});

export const { usePaymentTypesQuery } = paymentApi;
