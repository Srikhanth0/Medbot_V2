/**
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
  return `${value} ${unit}`;
};
