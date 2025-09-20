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
     bookConsultation: builder.mutation<any, any>({
      query: (data) => ({
        url: `/consultation/book`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['consultancyService'],
    }),
  }),
});

export const { useGetAllConsultancyServicesQuery,useBookConsultationMutation } = consultancyServiceApi;
