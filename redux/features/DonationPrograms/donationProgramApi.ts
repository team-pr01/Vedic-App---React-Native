import { baseApi } from "../../api/baseApi";


const donationProgramApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllDonationPrograms: builder.query({
      query: () => ({
        url: `/donations`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["donations"],
    }),

    getSingleDonationPrograms: builder.query({
      query: (id) => ({
        url: `/donations/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["donations"],
    }),

    
  }),
});

export const {
  useGetAllDonationProgramsQuery,
  useGetSingleDonationProgramsQuery,
} = donationProgramApi;
