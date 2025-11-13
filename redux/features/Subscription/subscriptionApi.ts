/* eslint-disable @typescript-eslint/no-explicit-any */

import { baseApi } from "@/redux/api/baseApi";

const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
   subscribe: builder.mutation<any, any>({
      query: (data) => ({
        url: `/subscription/subscribe`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["subscription"],
    }),
  }),
});

export const { useSubscribeMutation} = subscriptionApi;
