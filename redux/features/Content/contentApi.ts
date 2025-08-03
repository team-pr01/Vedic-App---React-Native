import { baseApi } from "@/redux/api/baseApi";


const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllContents: builder.query<any, { keyword?: string }>({
      query: () => {
        return {
          url: `/content`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["content"],
    }),

    getSingleContent: builder.query({
      query: (id) => ({
        url: `/content/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["content"],
    }),

    addContent: builder.mutation<any, any>({
      query: (data) => ({
        url: `/content/create-content`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["content"],
    }),

    deleteContent: builder.mutation<
      any,
      { contentId: string; type: "image" | "video"; url: string }
    >({
      query: (contentId) => ({
        url: `/content/delete-content/${contentId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["content"],
    }),

    updateContent: builder.mutation<any, any>({
      query: ({ id, data }) => ({
        url: `/content/${id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["content"],
    }),
  }),
});

export const {
  useGetAllContentsQuery,
  useGetSingleContentQuery,
  useAddContentMutation,
  useDeleteContentMutation,
  useUpdateContentMutation,
} = contentApi;
