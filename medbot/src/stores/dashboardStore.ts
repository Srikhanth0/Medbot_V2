import { create } from 'zustand';
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
