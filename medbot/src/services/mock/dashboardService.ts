import { Patient, VitalCard } from '../../types';

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
