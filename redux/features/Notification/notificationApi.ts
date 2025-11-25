import { baseApi } from '@/redux/api/baseApi';

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<any, { keyword?: string }>({
      query: (userId) => {
        return {
          url: `/notification/${userId}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['notification'],
    }),
  }),
});

export const { useGetMyNotificationsQuery } = notificationApi;
