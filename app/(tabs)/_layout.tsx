import React, { useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function TabLayout() {
  const colors = useThemeColors();

  // Redux + Router for auth guard
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();


  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          borderTopColor: colors.border,
          backgroundColor: 'transparent',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarBackground: () => (
          <LinearGradient
            colors={colors.tabBarBackground}
            style={StyleSheet.absoluteFillObject}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused && {
                  ...styles.focusedIcon,
                  backgroundColor: `${colors.primary}20`,
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
                  backgroundColor: `${colors.primary}20`,
                },
              ]}
            >
              <BookOpen size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="akf"
        options={{
          title: 'AKF',
          tabBarIcon: ({ size, color, focused }) => (
            <View
              style={[
                styles.akfIcon,
                {
                  backgroundColor: focused ? colors.info : colors.info,
                  transform: [{ scale: focused ? 1.1 : 1 }],
                  borderColor: colors.card,
                },
              ]}
            >
              <Star size={size * 0.8} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          ),
          tabBarLabelStyle: [
            styles.tabBarLabel,
            styles.akfLabel,
            { color: colors.info },
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
                  backgroundColor: `${colors.primary}20`,
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
                  backgroundColor: `${colors.warning}20`,
                },
              ]}
            >
              <AlertTriangle size={size} color={colors.warning} />
            </View>
          ),
          tabBarLabelStyle: [styles.tabBarLabel, { color: colors.warning }
            
          ],
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 85,
    paddingBottom: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
    width: '100%',
    marginBottom:50,
  },
  tabBarItem: {
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  akfLabel: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  iconContainer: {
    padding: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedIcon: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  akfIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: -20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
  },
});
