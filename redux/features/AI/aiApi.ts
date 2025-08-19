import { baseApi } from "@/redux/api/baseApi";

const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateRecipe: builder.mutation({
      query: (queryText: string) => ({
        url: "/ai/generate-recipe",
        method: "POST",
        body: { query: queryText },
      }),
    }),
  }),
});
export const { useGenerateRecipeMutation } = aiApi;