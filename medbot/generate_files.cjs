const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const files = {
  // Types
  'types/auth.ts': `export interface User {
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
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
`,
  'types/patient.ts': `export interface Patient {
  id: string;
  name: string;
  bloodType: string;
  age: number;
  avatarUrl?: string;
  healthScore: number;
  primaryDoctor: string;
}
`,
  'types/vitals.ts': `export type SparklineType = 'bar' | 'ecg' | 'sine' | 'zigzag';
export type VitalStatus = 'Normal' | 'Stable' | 'Elevated' | 'Low' | 'Critical';

export interface VitalColor {
  bg: string;
  text: string;
  badge: string;
  badgeText: string;
  stroke: string;
}

export interface VitalCard {
  id: string;
  title: string;
  value: string;
  secondaryValue?: string;
  unit: string;
  status: VitalStatus;
  sparklineType: SparklineType;
  icon: string;
  color: VitalColor;
}
`,
  'types/chat.ts': `export type ChatRole = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  attachmentUrl?: string;
  isStreaming?: boolean;
}
`,
  'types/calendar.ts': `export type CalendarEventType = 'reminder' | 'appointment' | 'medication';

export interface CalendarEvent {
  id: string;
  day: number;
  title: string;
  type: CalendarEventType;
  time?: string;
  doctor?: string;
  notes?: string;
}

export interface CalendarMonth {
  month: number;
  year: number;
  daysInMonth: number;
  startDay: number;
  events: CalendarEvent[];
}
`,
  'types/settings.ts': `export type SettingControlType = 'toggle' | 'button';

export interface SettingItem {
  id: string;
  label: string;
  description: string;
  controlType: SettingControlType;
  buttonLabel?: string;
  defaultValue?: boolean | string;
  isDanger?: boolean;
}

export interface SettingSection {
  title: string;
  items: SettingItem[];
}
`,
  'types/index.ts': `export * from './auth';
export * from './patient';
export * from './vitals';
export * from './chat';
export * from './calendar';
export * from './settings';

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}
`,
  // Constants
  'constants/colors.ts': `export const COLORS = {
  bgPrimary: '#11222C',
  bgSidebar: '#DDD4D8',
  bgCard: '#DDD4D8',
  bgInput: '#122B36',
  bgChatInput: '#49565C',
  accentCyan: '#0891B2',
  accentGreen: '#16A34A',
  accentSage: '#478768',
  glow: '#00A3E0',
  vitals: {
    blood: '#C84B4B',
    heart: '#388E7B',
    count: '#5B4EA1',
    glucose: '#CA5D3B'
  }
} as const;
`,
  'constants/navigation.ts': `export const NAV_ITEMS = [
  { path: '/dashboard', icon: 'Home', label: 'Home' },
  { path: '/dashboard/analytics', icon: 'BarChart3', label: 'Analytics' },
  { path: '/dashboard/integration', icon: 'LayoutGrid', label: 'Integration' },
  { path: '/dashboard/settings', icon: 'Settings', label: 'Settings' },
  { path: '/dashboard/calendar', icon: 'Calendar', label: 'Calendar' },
  { path: '/profile', icon: 'User', label: 'Profile' }
];
`,
  'constants/routes.ts': `export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CHAT: '/dashboard/chat',
  ANALYTICS: '/dashboard/analytics',
  INTEGRATION: '/dashboard/integration',
  CALENDAR: '/dashboard/calendar',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/profile'
} as const;
`,
  // Utils
  'utils/cn.ts': `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
  'utils/formatters.ts': `/**
 * Formats a date string to a readable format
 */
export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

/**
 * Formats a time string
 */
export const formatTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date));
};

/**
 * Formats vital values
 */
export const formatVitalValue = (value: number, unit: string): string => {
  return \\\`\\\${value} \\\${unit}\\\`;
};
`,
  'utils/validators.ts': `import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
});

export const profileFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  age: z.number().positive().min(1, 'Age must be a valid number'),
  emergencyContact: z.string().min(10, 'Valid emergency contact is required')
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
`,
  // Styles
  'styles/globals.css': `@import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');
@import "tailwindcss";

@theme {
  --color-bg-primary: #11222C;
  --color-bg-sidebar: #DDD4D8;
  --color-bg-card: #DDD4D8;
  --color-bg-input: #122B36;
  --color-bg-chat-input: #49565C;
  --color-accent-cyan: #0891B2;
  --color-accent-green: #16A34A;
  --color-accent-sage: #478768;
  --color-glow: #00A3E0;
  
  --font-sans: 'Figtree', sans-serif;
  --font-noto: 'Noto Sans', sans-serif;
}

body {
  background-color: var(--color-bg-primary);
  color: white;
  font-family: var(--font-sans);
}

.figma-bg-pattern {
  background-image: radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Custom sleek scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}
`,
  // Stores
  'stores/authStore.ts': `import { create } from 'zustand';
import { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const defaultUser: User = {
  id: 'u_1',
  name: 'Sarah Johnson',
  email: 'sarah.j@example.com',
  role: 'patient',
  bloodGroup: 'O+',
  age: 32,
  medicalId: 'MED-7829-45X',
  emergencyContact: '+1 (555) 019-2834',
  conditions: ['Mild Asthma'],
  insuranceProvider: 'BlueCross Health'
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: defaultUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateProfile: (data) => set((state) => ({ 
    user: state.user ? { ...state.user, ...data } : null 
  }))
}));
`,
  'stores/dashboardStore.ts': `import { create } from 'zustand';
import { Patient, VitalCard, PieSlice } from '../types';

interface DashboardState {
  patient: Patient | null;
  vitals: VitalCard[];
  pieData: PieSlice[];
  healthScore: number;
  recentActivity: any[];
  isLoading: boolean;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  patient: null,
  vitals: [],
  pieData: [],
  healthScore: 92,
  recentActivity: [],
  isLoading: false,
  fetchDashboardData: async () => {
    set({ isLoading: true });
    // TODO Phase 2: Replace with actual API call
    setTimeout(() => {
      set({
        patient: {
          id: 'p1',
          name: 'Sarah Johnson',
          bloodType: 'O+',
          age: 32,
          healthScore: 92,
          primaryDoctor: 'Dr. Michael Chen'
        },
        vitals: [
          {
            id: 'v1',
            title: 'Heart Rate',
            value: '72',
            unit: 'bpm',
            status: 'Normal',
            sparklineType: 'ecg',
            icon: 'Heart',
            color: { bg: 'bg-[#388E7B]/10', text: 'text-[#388E7B]', badge: 'bg-[#388E7B]/20', badgeText: 'text-[#388E7B]', stroke: '#388E7B' }
          },
          {
            id: 'v2',
            title: 'Blood Pressure',
            value: '120/80',
            unit: 'mmHg',
            status: 'Stable',
            sparklineType: 'bar',
            icon: 'Activity',
            color: { bg: 'bg-[#C84B4B]/10', text: 'text-[#C84B4B]', badge: 'bg-[#C84B4B]/20', badgeText: 'text-[#C84B4B]', stroke: '#C84B4B' }
          },
          {
            id: 'v3',
            title: 'Blood Sugar',
            value: '95',
            unit: 'mg/dL',
            status: 'Normal',
            sparklineType: 'zigzag',
            icon: 'Droplet',
            color: { bg: 'bg-[#CA5D3B]/10', text: 'text-[#CA5D3B]', badge: 'bg-[#CA5D3B]/20', badgeText: 'text-[#CA5D3B]', stroke: '#CA5D3B' }
          },
          {
            id: 'v4',
            title: 'White Blood Cell',
            value: '6.5',
            unit: '10³/µL',
            status: 'Normal',
            sparklineType: 'sine',
            icon: 'Microscope',
            color: { bg: 'bg-[#5B4EA1]/10', text: 'text-[#5B4EA1]', badge: 'bg-[#5B4EA1]/20', badgeText: 'text-[#5B4EA1]', stroke: '#5B4EA1' }
          }
        ],
        pieData: [
          { name: 'Proteins', value: 30, color: '#0891B2' },
          { name: 'Carbs', value: 45, color: '#16A34A' },
          { name: 'Fats', value: 25, color: '#478768' }
        ],
        isLoading: false
      });
    }, 1000);
  }
}));
`,
  'stores/chatStore.ts': `import { create } from 'zustand';
import { ChatMessage } from '../types';

interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  activeAnimation: 'idle' | 'talking';
  sendMessage: (text: string) => void;
  addBotResponse: (text: string) => void;
  clearChat: () => void;
}

const initialMessages: ChatMessage[] = [
  { id: '1', role: 'bot', content: 'Hello Sarah. How are you feeling today?', timestamp: new Date().toISOString() }
];

export const useChatStore = create<ChatStore>((set) => ({
  messages: initialMessages,
  isTyping: false,
  activeAnimation: 'idle',
  sendMessage: (text) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }],
    isTyping: true,
    activeAnimation: 'idle'
  })),
  addBotResponse: (text) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now().toString(),
      role: 'bot',
      content: text,
      timestamp: new Date().toISOString()
    }],
    isTyping: false,
    activeAnimation: 'idle'
  })),
  clearChat: () => set({ messages: initialMessages })
}));
`,
  'stores/calendarStore.ts': `import { create } from 'zustand';
import { CalendarMonth, CalendarEvent } from '../types';

interface CalendarStore {
  months: CalendarMonth[];
  events: CalendarEvent[];
  addReminder: (event: CalendarEvent) => void;
  deleteReminder: (id: string) => void;
  editReminder: (id: string, data: Partial<CalendarEvent>) => void;
}

// Mock initial data for 2026
const initialMonths: CalendarMonth[] = Array.from({ length: 12 }, (_, i) => ({
  month: i,
  year: 2026,
  daysInMonth: new Date(2026, i + 1, 0).getDate(),
  startDay: new Date(2026, i, 1).getDay(),
  events: []
}));

export const useCalendarStore = create<CalendarStore>((set) => ({
  months: initialMonths,
  events: [],
  addReminder: (event) => set((state) => ({ events: [...state.events, event] })),
  deleteReminder: (id) => set((state) => ({ events: state.events.filter(e => e.id !== id) })),
  editReminder: (id, data) => set((state) => ({
    events: state.events.map(e => e.id === id ? { ...e, ...data } : e)
  }))
}));
`,
  'stores/settingsStore.ts': `import { create } from 'zustand';
import { SettingSection } from '../types';

interface SettingsStore {
  sections: SettingSection[];
  toggleSetting: (id: string) => void;
  updateSetting: (id: string, val: any) => void;
}

const initialSections: SettingSection[] = [
  {
    title: 'Notifications',
    items: [
      { id: 'notif_push', label: 'Push Notifications', description: 'Receive push notifications', controlType: 'toggle', defaultValue: true },
      { id: 'notif_email', label: 'Email Notifications', description: 'Receive email notifications', controlType: 'toggle', defaultValue: false }
    ]
  },
  {
    title: 'Privacy',
    items: [
      { id: 'priv_data', label: 'Data Sharing', description: 'Share data with research partners', controlType: 'toggle', defaultValue: false },
      { id: 'priv_delete', label: 'Delete Account', description: 'Permanently delete your account', controlType: 'button', buttonLabel: 'Delete', isDanger: true }
    ]
  }
];

export const useSettingsStore = create<SettingsStore>((set) => ({
  sections: initialSections,
  toggleSetting: (id) => set((state) => ({
    sections: state.sections.map(sec => ({
      ...sec,
      items: sec.items.map(item => 
        item.id === id && item.controlType === 'toggle' 
          ? { ...item, defaultValue: !item.defaultValue } 
          : item
      )
    }))
  })),
  updateSetting: (id, val) => set((state) => ({
    sections: state.sections.map(sec => ({
      ...sec,
      items: sec.items.map(item => item.id === id ? { ...item, defaultValue: val } : item)
    }))
  }))
}));
`,
  'stores/notificationStore.ts': `import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    return { notifications: updated, unreadCount: updated.filter(n => !n.isRead).length };
  }),
  clearAll: () => set({ notifications: [], unreadCount: 0 })
}));
`,
  'stores/themeStore.ts': `import { create } from 'zustand';

interface ThemeStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}));
`,
  // Mock Services
  'services/mock/authService.ts': `import { User } from '../../types';

export const mockAuthService = {
  login: async (email: string, password: string):Promise<User> => {
    // TODO Phase 2: Implement real login API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'sarah.j@example.com' && password.length >= 6) {
          resolve({
            id: 'u_1',
            name: 'Sarah Johnson',
            email: 'sarah.j@example.com',
            role: 'patient',
            bloodGroup: 'O+',
            age: 32,
            medicalId: 'MED-7829-45X',
            emergencyContact: '+1 (555) 019-2834',
            conditions: ['Mild Asthma'],
            insuranceProvider: 'BlueCross Health'
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }
};
`,
  'services/mock/dashboardService.ts': `import { Patient, VitalCard } from '../../types';

// TODO Phase 2: Remove mock service and use real API
export const mockDashboardService = {
  getPatientData: async (): Promise<Patient> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'p1',
          name: 'Sarah Johnson',
          bloodType: 'O+',
          age: 32,
          healthScore: 92,
          primaryDoctor: 'Dr. Michael Chen'
        });
      }, 500);
    });
  },
  getVitals: async (): Promise<VitalCard[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'v1',
            title: 'Heart Rate',
            value: '72',
            unit: 'bpm',
            status: 'Normal',
            sparklineType: 'ecg',
            icon: 'Heart',
            color: { bg: 'bg-[#388E7B]/10', text: 'text-[#388E7B]', badge: 'bg-[#388E7B]/20', badgeText: 'text-[#388E7B]', stroke: '#388E7B' }
          },
          {
            id: 'v2',
            title: 'Blood Pressure',
            value: '120/80',
            unit: 'mmHg',
            status: 'Stable',
            sparklineType: 'bar',
            icon: 'Activity',
            color: { bg: 'bg-[#C84B4B]/10', text: 'text-[#C84B4B]', badge: 'bg-[#C84B4B]/20', badgeText: 'text-[#C84B4B]', stroke: '#C84B4B' }
          }
        ]);
      }, 600);
    });
  }
};
`,
  'services/mock/chatService.ts': `// TODO Phase 2: Connect to real LLM backend
export const mockChatService = {
  generateReply: async (message: string): Promise<string> => {
    return new Promise((resolve) => {
      const delay = Math.random() * 1000 + 500; // 500ms - 1500ms
      setTimeout(() => {
        if (message.toLowerCase().includes('headache')) {
          resolve("I'm sorry to hear you have a headache. Make sure you're well-hydrated and consider resting in a quiet, dark room. If it persists, please consult your primary doctor.");
        } else if (message.toLowerCase().includes('appointment')) {
          resolve("I can help you schedule an appointment. When would you like to see Dr. Chen?");
        } else {
          resolve("I understand. Based on your profile, your vitals are currently stable. Is there anything specific you would like me to check?");
        }
      }, delay);
    });
  }
};
`,
  'services/mock/calendarService.ts': `import { CalendarEvent } from '../../types';

// TODO Phase 2: Integrate with real calendar API
export const mockCalendarService = {
  getEvents: async (): Promise<CalendarEvent[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'e1',
            day: 15,
            title: 'Dr. Chen Appointment',
            type: 'appointment',
            time: '10:00 AM',
            doctor: 'Dr. Michael Chen',
            notes: 'Follow-up for asthma'
          }
        ]);
      }, 500);
    });
  }
};
`,
  'services/mock/uploadService.ts': `// TODO Phase 2: Implement actual OCR backend integration
export const mockUploadService = {
  processDocument: async (file: File): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: file.type.includes('image') ? 'ECG' : 'Prescription',
          insights: [
            "Normal Sinus Rhythm detected",
            "Heart Rate: 72 bpm within normal limits",
            "No abnormalities found in ST segment"
          ],
          confidenceScore: 0.94
        });
      }, 1500);
    });
  }
};
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(srcDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
});

console.log('Successfully created all files');
