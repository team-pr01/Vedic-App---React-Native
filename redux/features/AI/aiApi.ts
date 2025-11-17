import { baseApi } from '@/redux/api/baseApi';
import { TranslateShlokaArgs, TranslateShlokaResponse } from '@/types';

const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateRecipe: builder.mutation({
      query: (queryText: string) => ({
        url: '/ai/generate-recipe',
        method: 'POST',
        body: { query: queryText },
      }),
    }),
    generateVastu: builder.mutation({
      query: (queryText: string) => ({
        url: '/ai/generate-recipe',
        method: 'POST',
        body: { query: queryText },
      }),
    }),
  translateShloka: builder.mutation<TranslateShlokaResponse, TranslateShlokaArgs>({
      query: ({ text, targetLang }) => ({
        url: '/ai/translate-shloka',
        method: 'POST',
        body: { text, targetLang },
      }),
    }),

    chat: builder.mutation({
      query: (messageText: string) => ({
        url: '/ai/chat',
        method: 'POST',
        body: { message: messageText },
        credentials: 'include',
      }),
      invalidatesTags: ['users'],
    }),
  }),
});
export const {
  useGenerateRecipeMutation,
  useTranslateShlokaMutation,
  useChatMutation,
} = aiApi;
