// src/redux/features/Auth/authApi.ts
// (This file now becomes a feature-specific API definition)

import { baseApi } from '../../api/baseApi'; 
import { setUser } from './authSlice';

// Use `injectEndpoints` to add endpoints to the `baseApi`
const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login', 
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.data) {
            dispatch(setUser(data.data));
          }
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),

    signup: builder.mutation({
       query: (userInfo) => ({
         url: '/auth/register',
         method: 'POST',
         body: userInfo,
       }),
       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.data) {
            dispatch(setUser(data.data));
          }
        } catch (error) {
          console.error('Signup failed:', error);
        }
      },
    }),
    registerUser: builder.mutation<any, any>({
      query: (data) => ({
        url: `/auth/signup`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['users'],
    }),
    
  }),
});

export const { useLoginMutation, useSignupMutation, useRegisterUserMutation } = authApi;