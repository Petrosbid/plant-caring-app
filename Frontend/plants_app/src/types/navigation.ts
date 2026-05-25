// src/types/navigation.ts
import { LucideIcon } from 'lucide-react-native';

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Signup: undefined;
  Library: undefined;
  PlantDetails: { id: string };
  DiseaseDetails: { id: string };
  BlogList: undefined;
  BlogDetail: { slug: string };
  CareGuide: undefined;
  PlantRecommender: undefined;
  Identify: undefined;
  DiseaseCheck: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Garden: undefined;
  AI: undefined;
  Reminders: undefined;
  Profile: undefined;
};

export interface TabItemConfig {
  name: keyof RootTabParamList;
  label: string;
  icon: LucideIcon;
}
