import { baseApi } from "@/redux/api/baseApi";

const popUpApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPopUps: builder.query({
      query: () => {
        return {
          url: `/popup`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["popups"],
    }),
  }),
});

export const {
  useGetAllPopUpsQuery,
} = popUpApi;



