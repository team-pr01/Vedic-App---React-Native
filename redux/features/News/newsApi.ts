import { baseApi } from '@/redux/api/baseApi';

const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNews: builder.query<any, { keyword?: string; category?: string }>({
      query: ({ keyword, category }) => {
        const params = new URLSearchParams();

        if (keyword) params.append('keyword', keyword);
        if (category) params.append('category', category);

        return {
          url: `/news?${params.toString()}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['news'],
    }),

    getSingleNews: builder.query({
      query: (id) => ({
        url: `/news/${id}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['news'],
    }),
      likeNews: builder.mutation({
        query: (newsId) => ({
          url: `news/like/${newsId}`,
          method: 'PATCH',
        }),
        invalidatesTags: ['news'],
      }),
      viewNews: builder.mutation({
        query: (newsId) => ({
          url: `news/view/${newsId}`,
          method: 'PATCH',
        }),
        invalidatesTags: ['news'],
      }),
  }),
});

export const {
  useGetAllNewsQuery,
  useGetSingleNewsQuery,
  useLikeNewsMutation,
  useViewNewsMutation,
} = newsApi;
