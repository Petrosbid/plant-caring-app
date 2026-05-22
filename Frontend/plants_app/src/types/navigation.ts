// src/types/navigation.ts
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { LucideIcon } from 'lucide-react-native';

export type RootTabParamList = {
  Home: undefined;
  Calls: undefined;
  Activate: undefined;
  Favorites: undefined;
  More: undefined;
};

export interface TabItemConfig {
  name: keyof RootTabParamList;
  label: string;
  icon: LucideIcon;
}