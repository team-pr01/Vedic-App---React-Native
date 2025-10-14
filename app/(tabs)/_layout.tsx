import React from 'react';
import { Tabs } from 'expo-router';
import {
  BookOpen,
  Chrome as Home,
  Star,
  Newspaper,
  TriangleAlert as AlertTriangle,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useThemeColors } from '@/hooks/useThemeColors';
import Logo from "../../assets/icons/logo.png"
import { Image } from 'react-native';
import { useFocusEffect, useRouter, useSegments } from "expo-router";
import { BackHandler } from "react-native";
import { useCallback } from "react";


export default function TabLayout() {
  const colors = useThemeColors();
  const token = useSelector((state: RootState) => state.auth.token);
  const theme = useSelector((state: RootState) => state.theme.theme);
   const router = useRouter();
  const segments = useSegments();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const currentSegment = segments[segments.length - 1];
        console.log(currentSegment)
        if (currentSegment === "(tabs)") {
          return false;
        } else {
          router.replace("/(tabs)");
          return true; 
        }
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [segments, router])
  );



  return (
  <Tabs
  screenOptions={{
    headerShown: false,
    tabBarStyle: {
      backgroundColor: 'transparent', // transparent background
      position: 'absolute',
      borderTopWidth: 0,
      elevation: 0, // remove Android shadow
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.secondaryText,
    tabBarLabelStyle: styles.tabBarLabel,
    tabBarItemStyle: styles.tabBarItem,
    tabBarBackground: () => (
      <LinearGradient
        colors={theme === 'dark' ?['rgba(0,0,0 ,0.9)', 'rgba(0,0,0 ,0.7)']: ['rgba(255,255,255 ,0.9)', 'rgba(255,255,255 ,0.7)']}

        style={StyleSheet.absoluteFillObject}
      />
    ),
  }}
>

      {/* ---- Main 5 Tabs ---- */}
      <Tabs.Screen
        name="consultancy"
        options={{
          title: 'Consultancy',
          tabBarIcon: ({ size, color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  ...styles.focusedIcon,
                  backgroundColor: `${colors.primary}10`,
                },
              ]}
            >
              <Home size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="texts"
        options={{
          title: 'Learn',
          tabBarIcon: ({ size, color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  ...styles.focusedIcon,
                  backgroundColor: `${colors.primary}10`,
                },
              ]}
            >
              <BookOpen size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ size, color, focused }) => (
            <View
              style={[
                styles.akfIcon,
                {
                  backgroundColor: colors.primary,
                  transform: [{ scale: focused ? 1.1 : 1 }],
                  borderColor: colors.card,
                },
              ]}
            >
              <Image source={Logo} style={{ width: 44, height: 44, tintColor: '#FFFFFF' }} />
            </View>
          ),
          tabBarLabelStyle: [
            styles.tabBarLabel,
            styles.akfLabel,
            { color: colors.primary },
          ],
        }}
      />
      <Tabs.Screen
        name="meditation"
        options={{
          title: 'News',
          tabBarIcon: ({ size, color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  ...styles.focusedIcon,
                  backgroundColor: `${colors.primary}10`,
                },
              ]}
            >
              <Newspaper size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Emergency',
          tabBarIcon: ({ size, color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  ...styles.focusedIcon,
                  backgroundColor: `${colors.warning}10`,
                },
              ]}
            >
              <AlertTriangle size={size} color={colors.error} />
            </View>
          ),
          tabBarLabelStyle: [styles.tabBarLabel, { color: colors.error }],
        }}
      />

      {/* ---- Hidden Screens ---- */}
      <Tabs.Screen name="akf" options={{ href: null }} />
      <Tabs.Screen name="sanatan-sthal" options={{ href: null }} />
      <Tabs.Screen name="food" options={{ href: null }} />
      <Tabs.Screen name="jyotish" options={{ href: null }} />
      <Tabs.Screen name="vastu" options={{ href: null }} />
      <Tabs.Screen name="yoga" options={{ href: null }} />
      <Tabs.Screen name="veda-reader" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="ayurveda" options={{ href: null }} />
      <Tabs.Screen name="shop" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 48,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    width: '100%',
  },
  tabBarItem: {
    paddingTop: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 0,
  },
  akfLabel: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  iconContainer: {
    padding: 0,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedIcon: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding:6,
    // elevation: 4,
  },
  akfIcon: {
    width: 52,
    height: 52,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    marginBottom:10
  },
});