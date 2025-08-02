import { baseApi } from "@/redux/api/baseApi";

const reelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllReels: builder.query({
      query: () => {
        return {
          url: `/reels`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["reels"],
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
  useGetAllReelsQuery,
  useGetSingleReelQuery,
} = reelsApi;
