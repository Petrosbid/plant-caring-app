// 📁 src/types/index.ts
export interface PlantImage {
  id: number;
  image: string;                       
  image_url: string | null;           
  caption?: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface Plant {
  id: number;
  farsi_name: string;
  english_name: string | null;
  scientific_name: string | null;
  description: string;                
  description_en: string | null;
       
  is_favourited?: boolean;        
  favourite_count: number;
  comment_count: number;
  
  primary_image: string | null;

  is_toxic: boolean;

  watering_frequency: string | null;
  light_requirements: string | null;
  fertilizer_schedule: string | null;
  temperature_range: string | null;
  humidity_level: string | null;
  soil_type: string | null;
  pruning_info: string | null;
  propagation_methods: string | null;

  watering_frequency_en: string | null;
  light_requirements_en: string | null;
  fertilizer_schedule_en: string | null;
  temperature_range_en: string | null;
  humidity_level_en: string | null;
  soil_type_en: string | null;
  pruning_info_en: string | null;
  propagation_methods_en: string | null;

  care_difficulty: string;            
  care_difficulty_display: {          
    en: string;
    fa: string;
  };

  view_count: number;                
  garden_count: number;              

  created_at: string;
  updated_at: string;

  images?: PlantImage[];
  careInstructions?: CareInstruction[];
}

export interface CareInstruction {
  id: number;
  plantId: number;
  task: string;
  frequency: string;
  time: string;
  enabled: boolean;
}

export interface User {
  date_joined: any;
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone?: string;
}

export interface Disease {
  id: number;
  name: string;             
  name_fa: string | null;   
  description: string;
  description_fa: string | null;
  symptoms: string;
  symptoms_fa: string | null;
  solution: string;
  solution_fa: string | null;
  prevention_methods: string;   
  prevention_methods_fa: string | null;
  severity_level: string;
  spread_rate: string;
  affected_plants: Plant[];    
  view_count: number;
  created_at: string;
  updated_at: string;
  llm_analysis?: {
    disease_name_fa: string;
    description: string;
    severity: string;
    is_infectious: boolean;
    treatment_steps: string[];
    prevention: string;
  };
  detected_name?: string;
  confidence?: number;
}

export interface Reminder {
  id: number;
  user: number;
  user_plant?: number;
  title: string;
  description: string;
  care_type: 'watering' | 'fertilizing' | 'pruning' | 'pest_control' | 'repotting' | 'other';
  scheduled_date: string;
  is_completed: boolean;
  is_recurring: boolean;
  recurrence_interval?: number;
  created_at: string;
  updated_at: string;
  plantName?: string;
  task?: string;
  frequency?: string;
  time?: string;
  enabled?: boolean;
}

export interface UserPlant {
  id: number;
  user: number;
  plant: number;
  plant_details?: Plant;          
  nickname?: string;
  added_date: string;
  last_watered: string;
  next_watering_date?: string;
  watering_interval_days: number;
  last_fertilized: string;
  next_fertilizing_date?: string;
  fertilizing_interval_days: number;
  last_pruned: string;
  next_pruning_date?: string;
  pruning_interval_days: number;
  health_status: 'healthy' | 'needs_attention' | 'unhealthy';
  notes?: string;
}



export interface PlantFavorite {
  id: number;
  user: number;
  plant: number;
  created_at: string;
}

export interface PlantComment {
  id: number;
  user: number;
  user_name: string;      
  plant: number;
  parent?: number | null;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  replies?: PlantComment[]; 
}