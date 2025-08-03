import { baseApi } from '@/redux/api/baseApi';

const bookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBooks: builder.query<any, { keyword?: string }>({
      query: ({ keyword = '' }) => {
        return {
          url: `/book?keyword=${encodeURIComponent(keyword)}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['book'],
    }),

    getSingleBook: builder.query({
      query: (id) => ({
        url: `/book/${id}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['book'],
    }),
  }),
});

export const { useGetAllBooksQuery, useGetSingleBookQuery } = bookApi;
