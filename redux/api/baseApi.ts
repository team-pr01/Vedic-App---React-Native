// src/redux/api/baseApi.ts
// (I've renamed the folder to 'api' for clarity)

import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { setUser, logout } from '../features/Auth/authSlice';

// Original base query
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://192.168.0.102:5000/api/v1',
  // baseUrl: 'https://vedic-app-server.onrender.com/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`); // Standard practice to use 'Bearer'
    }
    return headers;
  },
});

// Base query with automatic re-authentication
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  unknown
> = async (args, api, extraOptions) => {
  // Wait for the initial query to resolve
  let result = await baseQuery(args, api, extraOptions);

  // Check if the query failed with a 401 Unauthorized error
  if (result.error && (result.error as any).status === 401) {
    console.log('Token expired, attempting to refresh...');

    // Attempt to refresh the token
    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'POST' }, // Assuming it's a POST request
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const refreshedData = refreshResult.data as { accessToken: string };
      console.log('Token refreshed successfully.');
      // Update the token in the Redux store
      // NOTE: Your refresh endpoint might return a full user object, adjust as needed.
      api.dispatch(setUser({ user: null, token: refreshedData.accessToken }));

      // Retry the original query with the new token
      console.log('Retrying the original request...');
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log('Failed to refresh token. Logging out.');
      // If refresh fails, log the user out completely
      api.dispatch(logout());
    }
  }
  return result;
};

// Define the single, central API slice
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'users',
    'consultancyService',
    'categories',
    'yoga',
    'news',
    'vastu',
    'course',
    'reels',
    'temple',
    'recipe',
    'content',
  ], // Add all your tag types here
  endpoints: () => ({}), // Endpoints are injected from other files
});
