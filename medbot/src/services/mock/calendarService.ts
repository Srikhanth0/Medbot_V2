import { CalendarEvent } from '../../types';

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
