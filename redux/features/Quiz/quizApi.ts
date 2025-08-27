import { baseApi } from "@/redux/api/baseApi";


const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllQuizzes: builder.query({
      query: () => {
        return {
          url: `/quiz`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["quiz"],
    }),

    getSingleQuiz: builder.query({
      query: (id) => ({
        url: `/quiz/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["quiz"],
    }),

    attendOnQuiz: builder.mutation({
      query: ({data, id}) => ({
        url: `/quiz/participate/${id}`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["quiz"],
    }),
  }),
});

export const {
  useGetAllQuizzesQuery,
  useGetSingleQuizQuery,
  useAttendOnQuizMutation,
} = quizApi;
