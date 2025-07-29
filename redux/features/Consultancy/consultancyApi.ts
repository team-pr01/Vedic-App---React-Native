import { baseApi } from '@/redux/api/baseApi';

const consultancyServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllConsultancyServices: builder.query({
      query: ({ keyword, category }) => ({
        url: '/consultancyService',
        method: 'GET',
        credentials: 'include',
        params: {
          keyword,
          category,
        },
      }),
      providesTags: ['consultancyService'],
    }),
  }),
});

export const { useGetAllConsultancyServicesQuery } = consultancyServiceApi;
