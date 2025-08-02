import { baseApi } from '@/redux/api/baseApi';

const recipeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRecipies: builder.query({
      query: ({ keyword, category }) => ({
        url: '/recipe',
        method: 'GET',
        credentials: 'include',
        params: {
          keyword,
          category,
        },
      }),
      providesTags: ['recipe'],
    }),

    getSingleRecipe: builder.query({
      query: (id) => ({
        url: `/recipe/${id}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['recipe'],
    }),
  }),
});

export const { useGetAllRecipiesQuery, useGetSingleRecipeQuery } = recipeApi;
