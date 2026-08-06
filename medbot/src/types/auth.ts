export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  bloodGroup: string;
  age: number;
  medicalId: string;
  emergencyContact: string;
  conditions: string[];
  insuranceProvider: string;
  joinedDate?: string;
  lastLogin?: string;
  provider?: string;
  theme?: string;
  modelSettings?: {
    xPosition: number;
    yPosition: number;
    zoom: number;
  };
  dashboardSettings?: {
    compactMode: boolean;
    autoScroll: boolean;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
