// src/navigation/RootNavigator.tsx
import React from 'react';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { MainTabs } from './MainTabs';
import { useAuth } from '../context/AuthContext';
import { View } from 'react-native';
import { Loader } from '../components/common/Loader';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import PlantDetailsScreen from '../screens/PlantDetailsScreen';
import DiseaseDetailsScreen from '../screens/DiseaseDetailsScreen';
import BlogListScreen from '../screens/BlogListScreen';
import BlogDetailScreen from '../screens/BlogDetailScreen';
import CareGuideScreen from '../screens/CareGuideScreen';
import PlantRecommenderScreen from '../screens/PlantRecommenderScreen';
import IdentifyScreen from '../screens/IdentifyScreen';
import DiseaseCheckScreen from '../screens/DiseaseCheckScreen';
import LibraryScreen from '../screens/LibraryScreen';
import DiseaseLibraryScreen from '../screens/DiseaseLibraryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={20} />
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Library" component={LibraryScreen} />
              <Stack.Screen name="DiseaseLibrary" component={DiseaseLibraryScreen} />
              <Stack.Screen name="PlantDetails" component={PlantDetailsScreen} />
              <Stack.Screen name="DiseaseDetails" component={DiseaseDetailsScreen} />
              <Stack.Screen name="BlogList" component={BlogListScreen} />
              <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
              <Stack.Screen name="CareGuide" component={CareGuideScreen} />
              <Stack.Screen name="PlantRecommender" component={PlantRecommenderScreen} />
              <Stack.Screen name="Identify" component={IdentifyScreen} />
              <Stack.Screen name="DiseaseCheck" component={DiseaseCheckScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};

