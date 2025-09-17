import { baseApi } from "@/redux/api/baseApi";

const reelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => {
        return {
          url: ` /product`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["products"],
    }),

    getSingleReel: builder.query({
      query: (id) => ({
        url: `/reels/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["reels"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetSingleReelQuery,
} = reelsApi;
