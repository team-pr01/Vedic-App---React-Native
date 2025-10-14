import { baseApi } from '@/redux/api/baseApi';

const vastuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllVastu: builder.query({
      query: ({ keyword, category }) => ({
        url: '/vastu',
        method: 'GET',
        credentials: 'include',
        params: {
          keyword,
          category,
        },
      }),
      providesTags: ['vastu'],
    }),
    getAllVastuTips: builder.query({
      query: ({ keyword, category }) => ({
        url: '/vastuTips',
        method: 'GET',
        credentials: 'include',
        params: {
          keyword,
          category,
        },
      }),
      providesTags: ['vastu'],
    }),

    getSingleVastu: builder.query({
      query: (id) => ({
        url: `/vastu/${id}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['vastu'],
    }),
  }),
});

export const { useGetAllVastuQuery, useGetSingleVastuQuery,useGetAllVastuTipsQuery } = vastuApi;
