import { baseApi } from '@/redux/api/baseApi';

const templeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTemple: builder.query({
      query: ({keyword}) => {
        return {
          url: '/temple',
          method: 'GET',
          credentials: 'include',
          params: {
            keyword,
          },
        };
      },
      providesTags: ['temple'],
    }),


    
    getSingleTemple: builder.query({
      query: (id) => ({
        url: `/temple/${id}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['temple'],
    }),

    addTemple: builder.mutation<any, any>({
      query: (data) => ({
        url: `/temple/add-temple`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['temple'],
    }),
  }),
});

export const {
  useGetAllTempleQuery,
  useGetSingleTempleQuery,
  useAddTempleMutation,
} = templeApi;
