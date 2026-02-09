// PlantImage interface
export interface PlantImage {
  id: number;
  image: string; // URL to the image
  caption?: string;
  is_primary: boolean;
  created_at: string;
}

// Plant interface
export interface Plant {
  id: number;
  farsi_name: string;
  scientific_name: string;
  description: string;
  primary_image?: string; // URL to the primary image
  is_toxic: boolean;
  watering_frequency: string;
  light_requirements: string;
  fertilizer_schedule: string;
  temperature_range: string;
  humidity_level: string;
  soil_type: string;
  pruning_info: string;
  propagation_methods: string;
  care_difficulty: string;
  created_at: string;
  updated_at: string;
  images?: PlantImage[]; // List of all images for this plant
  careInstructions?: CareInstruction[];
}

// Care instruction interface
export interface CareInstruction {
  id: number;
  plantId: number;
  task: string;
  frequency: string;
  time: string;
  enabled: boolean;
}

// User interface
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone?: string;
}

// Disease interface
export interface Disease {
  id: number;
  name: string;
  description: string;
  symptoms: string;
  solution: string;
  prevention_methods: string[];
  severity_level: string;
  spread_rate: string;
  affected_plants: any[];
  created_at: string;
  updated_at: string;
  // Additional fields from LLM analysis
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

// Reminder interface
export interface Reminder {
  id: number;
  user: number;
  user_plant?: number; // Reference to the specific plant in user's garden
  title: string;
  description: string;
  care_type: 'watering' | 'fertilizing' | 'pruning' | 'pest_control' | 'repotting' | 'other'; // Type of care reminder
  scheduled_date: string;
  is_completed: boolean;
  is_recurring: boolean; // Whether this is a recurring reminder
  recurrence_interval?: number; // Interval in days for recurring reminders
  created_at: string;
  updated_at: string;
  // UI / form display fields (optional, may come from API or form)
  plantName?: string;
  task?: string;
  frequency?: string;
  time?: string;
  enabled?: boolean;
}

// UserPlant interface (for plants in user's garden)
export interface UserPlant {
  id: number;
  user: number;
  plant: number; // Reference to the plant in the main database
  plant_details?: Plant; // Full plant details
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