import { baseApi } from "@/redux/api/baseApi";


const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
   getAllNews: builder.query<any, { keyword?: string; category?: string }>({
  query: ({ keyword, category }) => {
    const params = new URLSearchParams();

    if (keyword) params.append("keyword", keyword);
    if (category) params.append("category", category);

    return {
      url: `/news?${params.toString()}`,
      method: "GET",
      credentials: "include",
    };
  },
  providesTags: ["news"],
}),


    getSingleNews: builder.query({
      query: (id) => ({
        url: `/news/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["news"],
    }),
  }),
});

export const {
  useGetAllNewsQuery,
  useGetSingleNewsQuery,
} = newsApi;
