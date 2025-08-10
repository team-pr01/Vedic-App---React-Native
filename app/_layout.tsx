// app/_layout.tsx
import { Stack, router, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect, useRef, useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store, RootState } from '@/redux/store';

// Fonts
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Linking, StatusBar } from 'react-native';
import PopupNotification from '@/components/PopupNotification';
import { useGetAllPopUpsQuery } from '@/redux/features/Popup/popUpApi';

import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/components/NotificationService';
import { useSavePushNotificationTokenMutation } from '@/redux/features/Auth/authApi';
import { useCurrentUser } from '@/redux/features/Auth/authSlice';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function RootLayoutNav() {
  const user = useSelector(useCurrentUser);
  const [savePushNotificationToken] = useSavePushNotificationTokenMutation();
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthLoading = useSelector(
    (state: RootState) => state._persist.rehydrated
  );
  const { data, isLoading } = useGetAllPopUpsQuery({});
  console.log(data, ' Popups Data');
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthLoading = useSelector(
    (state: RootState) => state._persist.rehydrated
  ); // Check if redux-persist is done
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Expo push token state
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  console.log('Expo Push Token:', expoPushToken);
  console.log('Userid:', user?._id);

  useEffect(() => {
    const registerAndSendToken = async () => {
      try {
        if (expoPushToken) {
          if (user._id && expoPushToken) {
            const payload = {
              userId: user._id,
              expoPushToken
            }
            await savePushNotificationToken(payload).unwrap();
            console.log('Push token saved successfully');
          }
        }
      } catch (error) {
        console.error('Error saving push token:', error);
      }
    };

    registerAndSendToken();
  }, [user?._id]);

  // Notification listeners refs
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // 1️⃣ Register push notifications immediately on mount
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // TODO: send token to your backend here if needed
      }
    });

    // Listen for notifications received when app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
      });

    // Listen for user interaction with notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification clicked:', response);
      });

    // Cleanup listeners on unmount
    Notifications.removeNotificationSubscription(notificationListener.current);
    Notifications.removeNotificationSubscription(responseListener.current);
  }, []);

  // 2️⃣ Handle splash screen and routing based on auth & fonts

  useEffect(() => {
    // if (data || data.length > 0) {
    setShowWelcomePopup(true);
    // }
  }, [data]);
  useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    if (!isAuthLoading) return;

    if (token) {
      router.replace('/(tabs)');
    } else {
      router.replace('/auth');
    }

    SplashScreen.hideAsync();
  }, [token, fontsLoaded, fontError, isAuthLoading]);

  if (!fontsLoaded && !fontError) {
    return null; // Don't render anything until fonts load
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
      </Stack>
      <StatusBar barStyle="default" />
      <PopupNotification
        isVisible={showWelcomePopup}
        title={data?.data?.[0]?.title}
        message="Explore spiritual knowledge and connect with tradition."
        imageUrl={data?.data?.[0]?.imageUrl}
        imageHeight={150}
        onClose={() => setShowWelcomePopup(false)}
        onClick={() => {
          setShowWelcomePopup(false);
          const btnLink = data?.data?.[0]?.btnLink;
          if (btnLink) {
            Linking.openURL(btnLink).catch((err) =>
              console.error('Failed to open link', err)
            );
          } else {
            router.push('/(tabs)'); 
          }
        }}
        btnText={data?.data?.[0]?.btnText || 'Got it!'}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutNav />
      </PersistGate>
    </Provider>
  );
}
