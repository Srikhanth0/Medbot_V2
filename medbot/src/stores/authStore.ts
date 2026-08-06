import { create } from 'zustand';
import { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  login: (userOrEmail?: User | string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const defaultUser: User = {
  id: 'u_1',
  name: 'Sarah Johnson',
  email: 'sarah.j@example.com',
  role: 'patient',
  bloodGroup: 'A+',
  age: 28,
  medicalId: 'MC-792BD012',
  emergencyContact: '+1 (555) 019-2834',
  conditions: ['Mild Asthma'],
  insuranceProvider: 'BlueCross Health'
};

const getInitialUser = (): User | null => {
  try {
    const cached = localStorage.getItem('medbot_user_profile');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object' && parsed.id) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }
  return null;
};

const initialUser = getInitialUser();

export const useAuthStore = create<AuthStore>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  isLoading: false,
  error: null,
  login: (userOrEmail) => {
    let selectedUser: User;
    if (typeof userOrEmail === 'object' && userOrEmail !== null) {
      selectedUser = userOrEmail;
    } else if (typeof userOrEmail === 'string') {
      selectedUser = { ...defaultUser, email: userOrEmail, name: userOrEmail.split('@')[0] };
    } else {
      selectedUser = defaultUser;
    }
    
    try {
      localStorage.setItem('medbot_user_profile', JSON.stringify(selectedUser));
    } catch (e) {
      // Ignore quota errors
    }

    set({ user: selectedUser, isAuthenticated: true });
  },
  logout: () => {
    try {
      localStorage.removeItem('medbot_user_profile');
    } catch (e) {
      // Ignore
    }
    set({ user: null, isAuthenticated: false });
  },
  updateProfile: (data) => set((state) => {
    if (!state.user) return { user: null };
    const updated = { ...state.user, ...data };
    try {
      localStorage.setItem('medbot_user_profile', JSON.stringify(updated));
    } catch (e) {
      // Ignore quota errors
    }
    return { user: updated };
  })
}));

export default useAuthStore;
