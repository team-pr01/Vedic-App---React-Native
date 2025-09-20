import { baseApi } from "@/redux/api/baseApi";

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query<any, { keyword?: string; category?: string }>(
      {
        query: ({ keyword = "", category }) => {
          let queryStr = `?keyword=${encodeURIComponent(keyword)}`;
          if (category) {
            queryStr += `&category=${encodeURIComponent(category)}`;
          }
          return {
            url: `/product${queryStr}`,
            method: "GET",
            credentials: "include",
          };
        },
        providesTags: ["product"],
      }
    ),

    getSingleProduct: builder.query({
      query: (id) => ({
        url: `/product/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["product"],
    }),

    updateProductClicks: builder.mutation<any, any>({
      query: (id ) => ({
        url: `/product/update-click/${id}`,
        method: "PUT",
        credentials: "include",
      }),
      invalidatesTags: ["product"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useUpdateProductClicksMutation,
} = productApi;
