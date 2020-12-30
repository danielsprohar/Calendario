export const statuses = ['busy', 'free'];
export const defaultStatus = statuses[0];

export const repeats = [
  'never',
  'daily',
  'weekly',
  'monthly',
  'annually',
  'every weekday',
  'every weekend'
];
export const defaultOccurrence = repeats[0];

export class CalendarEvent {
  id: string;
  title: string;
  status: string;
  description: string;
  startDate?: Date;
  endDate?: Date;
  isAllDay: boolean;
  repeats: string = 'never';

  constructor(fields?: {
    id?: string;
    title?: string;
    status?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    isAllDay?: boolean;
    repeats?: string;
  }) {
    Object.assign(this, fields);
  }
}
