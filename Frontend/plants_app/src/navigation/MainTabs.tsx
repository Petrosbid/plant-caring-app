// src/navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GlassTabBar } from '../components/navigation/GlassTabBar';
import { RootTabParamList } from '../types/navigation';

// Placeholder screens for now - will be moved to src/screens
import HomeScreen from '../screens/HomeScreen';
import MyGardenScreen from '../screens/MyGardenScreen';
import AIScreen from '../screens/AIScreen';
import RemindersScreen from '../screens/RemindersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Garden" component={MyGardenScreen} />
      <Tab.Screen name="AI" component={AIScreen} />
      <Tab.Screen name="Reminders" component={RemindersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

