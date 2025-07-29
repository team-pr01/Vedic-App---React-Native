import { baseApi } from "@/redux/api/baseApi";


const yogaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllYoga: builder.query({
      query: () => {
        return {
          url: `/yoga`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["yoga"],
    }),

    getSingleYoga: builder.query({
      query: (id) => ({
        url: `/yoga/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["yoga"],
    }),


  }),
});

export const {
  useGetAllYogaQuery,
  useGetSingleYogaQuery,
} = yogaApi;
