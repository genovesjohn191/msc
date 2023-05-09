import {
  Observable,
  BehaviorSubject
} from 'rxjs';
import { Day, Week, dayText, weekText } from '@app/models';
import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

export type ScheduleDay = {
  checked: boolean;
  name: string;
  day: Day;
};

export type ScheduleWeek = {
  checked: boolean;
  name: string;
  week: Week;
};


export class OsUpdatesScheduleDetails {
  private _time: string;
  private _period: string;
  private _scheduleDays: ScheduleDay[];
  private _scheduleDaysChange: BehaviorSubject<ScheduleDay[]>;
  private _scheduleWeeks: ScheduleWeek[];
  private _scheduleWeeksChange: BehaviorSubject<ScheduleWeek[]>;

  /**
   * Returns the time of the schedule
   */
  public get time(): string {
    return this._time;
  }

  /**
   * Returns the period of the schedule
   */
  public get period(): string {
    return this._period;
  }

  constructor(scheduleWeeks?: ScheduleWeek[], scheduleDays?: ScheduleDay[], time?: string, period?: string) {
    this._scheduleWeeks = !isNullOrEmpty(scheduleWeeks) ? scheduleWeeks : [
      { week: Week.First, name: weekText[Week.First], checked: false },
      { week: Week.Second, name: weekText[Week.Second], checked: false },
      { week: Week.Third, name: weekText[Week.Third], checked: false },
      { week: Week.Fourth, name: weekText[Week.Fourth], checked: false },
      { week: Week.Fifth, name: weekText[Week.Fifth], checked: false }
    ];
    this._scheduleWeeksChange = new BehaviorSubject<ScheduleWeek[]>(this._scheduleWeeks);

    this._scheduleDays = !isNullOrEmpty(scheduleDays) ? scheduleDays : [
      { day: Day.Sunday, name: dayText[Day.Sunday], checked: false },
      { day: Day.Monday, name: dayText[Day.Monday], checked: false },
      { day: Day.Tuesday, name: dayText[Day.Tuesday], checked: false },
      { day: Day.Wednesday, name: dayText[Day.Wednesday], checked: false },
      { day: Day.Thursday, name: dayText[Day.Thursday], checked: false },
      { day: Day.Friday, name: dayText[Day.Friday], checked: false },
      { day: Day.Saturday, name: dayText[Day.Saturday], checked: false },
    ];
    this._scheduleDaysChange = new BehaviorSubject<ScheduleDay[]>(this._scheduleDays);
    this._time = time;
    this._period = period;
  }

  public scheduleDaysChange(): Observable<ScheduleDay[]> {
    return this._scheduleDaysChange.asObservable();
  }

  /**
   * Tick all the days of the schedule days based on an array provided
   * @param days days index in an array
   */
  public setDays(...days: Day[]): void {
    this._scheduleDays.forEach((scheduleDay) => {
      scheduleDay.checked = !isNullOrUndefined(days.find((day) => (scheduleDay.day === +day)));
    });
    this._scheduleDaysChange.next(this._scheduleDays);
  }

  /**
   * Unselect all or sets all the schedule days to false
   */
  public resetDays(): void {
    this._scheduleDays.forEach((selectionDay) => {
      selectionDay.checked = false;
    });
    this._scheduleDaysChange.next(this._scheduleDays);
  }

  public scheduleWeeksChange(): Observable<ScheduleWeek[]> {
    return this._scheduleWeeksChange.asObservable();
  }

  /**
   * Tick all the weeks of the schedule weeks based on an array provided
   * @param weeks weeks index in an array
   */
  public setWeeks(...weeks: Week[]): void {
    this._scheduleWeeks.forEach((scheduleWeek) => {
      scheduleWeek.checked = !isNullOrUndefined(weeks.find((week) => (scheduleWeek.week === +week)));
    });
    this._scheduleWeeksChange.next(this._scheduleWeeks);
  }

  /**
   * Unselect all or sets all the schedule weeks to false
   */
  public resetWeeks(): void {
    this._scheduleWeeks.forEach((selectionWeek) => {
      selectionWeek.checked = false;
    });
    this._scheduleWeeksChange.next(this._scheduleWeeks);
  }
}