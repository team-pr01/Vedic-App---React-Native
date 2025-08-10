import { baseApi } from "@/redux/api/baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userInfo) => ({
        url: '/auth/login',
        method: 'POST',
        body: userInfo,
      }),
    }),

    signup: builder.mutation({
      query: (signupData) => ({
        method: 'POST',
        url: '/auth/signup',
        body: signupData,
      }),
      // invalidatesTags : ["products"]
    }),

    getMe: builder.query({
      query: () => ({
        method: 'GET',
        url: `/user/me`,
      }),
      providesTags: ['users'],
    }),

    getUserById: builder.query({
      query: (userId) => ({
        method: 'GET',
        url: `/user/${userId}`,
      }),
      providesTags: ['users'],
    }),

    updateProfile: builder.mutation({
      query: (profileUpdatedData) => ({
        method: 'PUT',
        url: `/user/me`,
        body: profileUpdatedData,
      }),
      invalidatesTags: ['users'],
    }),

    changeUserRoleToAdmin: builder.mutation({
      query: (userId) => ({
        url: `/users/make-admin/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['users'],
    }),

    changeUserRoleToUser: builder.mutation({
      query: (userId) => ({
        url: `/users/make-user/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['users'],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/delete-user/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['users'],
    }),

    forgetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/forgot-password`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['users'],
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['users'],
    }),

    
    savePushNotificationToken: builder.mutation({
      query: (profileUpdatedData) => ({
        method: 'POST',
        url: `/auth/save-push-notification-token`,
        body: profileUpdatedData,
      }),
      invalidatesTags: ['users'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useUpdateProfileMutation,
  useGetMeQuery,
  useGetUserByIdQuery,
  useChangeUserRoleToAdminMutation,
  useChangeUserRoleToUserMutation,
  useDeleteUserMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useSavePushNotificationTokenMutation
} = authApi;
