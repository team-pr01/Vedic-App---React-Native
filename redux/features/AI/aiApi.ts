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
      query: (data) => ({
        url: `/ai/generate-vastu`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['vastu'],
    }),
    translateShloka: builder.mutation<
      TranslateShlokaResponse,
      TranslateShlokaArgs
    >({
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
  useGenerateVastuMutation
} = aiApi;
