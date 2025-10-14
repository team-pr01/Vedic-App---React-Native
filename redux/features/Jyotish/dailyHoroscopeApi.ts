import { baseApi } from "@/redux/api/baseApi";

const dailyHoroscopeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAllDailyHoroscopes: builder.query({
      query: (params) => {
        let queryStr = "";
        if (params) {
          const queryParams = new URLSearchParams();
          if (params.keyword) queryParams.append("keyword", params.keyword);
          queryStr = `?${queryParams.toString()}`;
        }
        return {
          url: `/dailyHoroscope${queryStr}`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["dailyHoroscope"],
    }),

    getSingleDailyHoroscope: builder.query({
      query: (id) => ({
        url: `/dailyHoroscope/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["dailyHoroscope"],
    }),

    generateKundli: builder.mutation({
      query: (data) => ({
        url: `/ai/generate-kundli`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["dailyHoroscope"],
    }),
    GenerateMuhurta: builder.mutation({
      query: (data) => ({
        url: `/ai/generate-muhurta`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["dailyHoroscope"],
    }),

  }),
});

export const {
  useGetAllDailyHoroscopesQuery,
  useGetSingleDailyHoroscopeQuery,
  useGenerateMuhurtaMutation,
  useGenerateKundliMutation,

} = dailyHoroscopeApi;
