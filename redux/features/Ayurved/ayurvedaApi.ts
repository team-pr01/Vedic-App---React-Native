import { baseApi } from "@/redux/api/baseApi";


const ayurvedaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAyurveda: builder.query({
      query: (params) => {
        let queryStr = "";
        if (params) {
          const queryParams = new URLSearchParams();
          if (params.keyword) queryParams.append("keyword", params.keyword);
          if (params.category) queryParams.append("category", params.category);
          queryStr = `?${queryParams.toString()}`;
        }
        return {
          url: `/ayurveda${queryStr}`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["ayurveda"],
    }),

    getSingleAyurveda: builder.query({
      query: (id) => ({
        url: `/ayurveda/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["ayurveda"],
    }),

    addAyurveda: builder.mutation({
      query: (data) => ({
        url: `/ayurveda/add`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["ayurveda"],
    }),

    updateAyurveda: builder.mutation({
      query: ({ id, data }) => ({
        url: `/ayurveda/update/${id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["ayurveda"],
    }),

    deleteAyurveda: builder.mutation({
      query: (id) => ({
        url: `/ayurveda/delete/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["ayurveda"],
    }),
  }),
});

export const {
  useGetAllAyurvedaQuery,
  useGetSingleAyurvedaQuery,
  useAddAyurvedaMutation,
  useUpdateAyurvedaMutation,
  useDeleteAyurvedaMutation,
} = ayurvedaApi;
