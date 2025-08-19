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

    chat: builder.mutation({
      query: (messageText: string) => ({ 
        url: "/ai/chat",
        method: "POST",
        body: { message: messageText }, 
        credentials:"include"
      }),
      invalidatesTags:["users"]
    }),

  }),
});
export const { useGenerateRecipeMutation,
  useChatMutation
 } = aiApi;