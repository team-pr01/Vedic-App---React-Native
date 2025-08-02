// app/_layout.tsx

import { Stack, router, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store, RootState } from '@/redux/store'; // Make sure RootState is exported from your store file

// Font imports
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthLoading = useSelector((state: RootState) => state._persist.rehydrated); // Check if redux-persist is done

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    // Wait for fonts and redux-persist to be ready
    if (!fontsLoaded && !fontError) return;
    if (!isAuthLoading) return;

    // Now we can safely check the token and navigate
    if (token) {
      // User is logged in, go to the main app
      router.replace('/(tabs)');
    } else {
      // User is not logged in, go to the auth screen
      router.replace('/auth');
    }

    // Hide the splash screen once we have navigated
    SplashScreen.hideAsync();

  }, [token, fontsLoaded, fontError, isAuthLoading]);

  if (!fontsLoaded && !fontError) {
    return null; // Render nothing until fonts are loaded
  }

  // Define the routes that the gatekeeper can navigate to.
  // The logic in useEffect will handle which one is shown.
  return (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" />
            </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      {/* PersistGate will show its loading component (null) until rehydration is complete */}
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutNav />
      </PersistGate>
    </Provider>
  );
}