export type CalendarEventType = "reminder" | "appointment" | "medication";

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
  month: string;
  year: number;
  daysInMonth: number;
  startDay: number;
  events: CalendarEvent[];
}
