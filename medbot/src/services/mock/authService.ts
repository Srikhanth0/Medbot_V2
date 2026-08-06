import { User } from '../../types';

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
