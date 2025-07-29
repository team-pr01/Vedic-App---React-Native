import { baseApi } from '@/redux/api/baseApi';

const categoriesServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: () => ({
        url: '/category',
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['categories'],
    }),
  }),
});

export const { useGetAllCategoriesQuery } = categoriesServiceApi;
