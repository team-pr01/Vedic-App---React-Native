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
        url: `/book-text/filter?bookId=${id}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['book'],
    }),
    getSingleVeda: builder.query({
      query: ({
        id,
        field1,
        field2,
        field3,
        field1Value,
        field2Value,
        field3Value,
      }) => {
        let url = `/book-text/filter?bookId=${id}`;

        if (field1 && field1Value)
          url += `&${field1}=${encodeURIComponent(field1Value)}`;
        if (field2 && field2Value)
          url += `&${field2}=${encodeURIComponent(field2Value)}`;
        if (field3 && field3Value)
          url += `&${field3}=${encodeURIComponent(field3Value)}`;

        return {
          url,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['book'],
    }),
    reportMantra: builder.mutation<
      any,
      {
        bookId: string;
        textId: string;
        originalText: string;
        translation: string;
        reason: string;
        feedback: string;
        languageCode: string;
      }
    >({
      query: (data) => ({
        url: '/reportMantra/report',
        method: 'POST',
        body:data,
        credentials: 'include',
      }),
      invalidatesTags: ['book'],
    }),
  }),
});

export const {
  useGetAllBooksQuery,
  useGetSingleBookQuery,
  useGetSingleVedaQuery,
  useReportMantraMutation,
} = bookApi;
