import { TestBed } from '@angular/core/testing';
import { CalendarEvent } from '../calendar/models/calendar-event';

import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService<CalendarEvent>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
