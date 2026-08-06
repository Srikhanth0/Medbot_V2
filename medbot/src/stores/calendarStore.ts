import { create } from 'zustand';
import type { CalendarMonth, CalendarEvent } from '../types';
import { mockCalendar2026 } from '../mock/calendar';

interface CalendarStore {
  months: CalendarMonth[];
  events: CalendarEvent[];
  addReminder: (event: CalendarEvent) => void;
  deleteReminder: (id: string) => void;
  editReminder: (id: string, data: Partial<CalendarEvent>) => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  months: mockCalendar2026,
  events: mockCalendar2026.flatMap((m) => m.events),
  addReminder: (event) => set((state) => ({ events: [...state.events, event] })),
  deleteReminder: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
  editReminder: (id, data) => set((state) => ({
    events: state.events.map((e) => (e.id === id ? { ...e, ...data } : e)),
  })),
}));
