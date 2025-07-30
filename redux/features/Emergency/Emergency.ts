

import { baseApi } from '../../api/baseApi'; // Import the central baseApi

// Define the shape of the data we will send to the API
interface EmergencyPayload {
  user: string; // This should be the user's ID
  message: string;
  location: string;
}

// Use `injectEndpoints` to add the new mutation to our existing API setup
const emergencyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendEmergencyAlert: builder.mutation<any, EmergencyPayload>({
      query: (data) => ({
        url: '/emergency', // The base URL is already in baseApi
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export the auto-generated hook for use in our component
export const { useSendEmergencyAlertMutation } = emergencyApi;