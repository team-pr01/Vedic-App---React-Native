import { baseApi } from "@/redux/api/baseApi";

const productBannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProductBanners: builder.query({
      query: () => ({
        url: `/product-banner`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["productBanner"],
    }),

    getSingleProductBanner: builder.query({
      query: (id) => ({
        url: `/product-banner/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["productBanner"],
    }),
  }),
});

export const {
  useGetAllProductBannersQuery,
  useGetSingleProductBannerQuery
} = productBannerApi;
