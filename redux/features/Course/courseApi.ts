import { baseApi } from "@/redux/api/baseApi";

const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAlCourses: builder.query({
      query: ({ keyword, category }) => ({
        url: `/course`,
        method: "GET",
        credentials: "include",
        params: {
          keyword,
          category,
        },
      }),
      providesTags: ["course"],
    }),

    getSingleCourse: builder.query({
      query: (id) => ({
        url: `/course/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["course"],
    }),
  }),
});

export const {
  useGetAlCoursesQuery,
  useGetSingleCourseQuery,
} = courseApi;
