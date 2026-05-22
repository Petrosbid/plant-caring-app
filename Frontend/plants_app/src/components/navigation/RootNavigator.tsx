// src/navigation/RootNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GlassTabBar } from './GlassTabBar';
import { RootTabParamList } from '../../types/navigation';


const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarTransparent: true, 
      }}
    >
      <Tab.Screen name="Home" component={DummyScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Calls" component={DummyScreen} options={{ tabBarLabel: 'Lines' }} />
      <Tab.Screen name="Activate" component={DummyScreen} options={{ tabBarLabel: 'Activate' }} />
      <Tab.Screen name="Favorites" component={DummyScreen} options={{ tabBarLabel: 'Fav' }} />
      <Tab.Screen name="More" component={DummyScreen} options={{ tabBarLabel: 'More' }} />
    </Tab.Navigator>
  );
};