import { Day } from '@app/models';
import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

export type ScheduleDay = {
  checked: boolean;
  name: string;
  day: Day;
};

export enum DayFrequency {
  Everyday = 1,
  Weekends = 2,
  Weekdays = 3
}

export class OsUpdatesScheduleDetails {
  private _scheduleDays: ScheduleDay[];
  private _time: string;
  private _period: string;
  private _isEveryday: boolean;

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

  /**
   * Returns the schedule days array
   */
  public get scheduleDays(): ScheduleDay[] {
    return this._scheduleDays;
  }

  /**
   * Returns the array of days selected
   */
  public get selectedScheduleDaysAsArray(): number[] {
    return this._getSelectedScheduleDaysAsArray();
  }

  /**
   * Returns the number of days that are selected from the schedule days
   */
  public get selectedScheduleDaysCount(): number {
    return this._getSelectedScheduleDays().length;
  }

  /**
   * Returns true if atleast one schedule day is selected
   */
  public get hasSelection(): boolean {
    return this._getSelectedScheduleDays().length > 0;
  }

  /**
   * Returns true if all of the days are selected
   */
  public get isEveryday(): boolean {
    let unSelectedDay = this._scheduleDays.find((selection) => !selection.checked);
    return this._isEveryday = isNullOrEmpty(unSelectedDay);
  }

  /**
   * Returns true if Monday through Friday are checked/ticked
   * See Day Enum for day index reference
   */
  public get isWeekdays(): boolean {
    if (this.selectedScheduleDaysCount !== 5) {
      return false;
    }
    let selectedDays = this._scheduleDays.filter((scheduleDay) => {
      return this._dayFallsOnWeekdays(scheduleDay.day) && scheduleDay.checked;
    });
    let hasAllWeekdaysOnly = selectedDays.length === 5 && !this._isEveryday;
    return hasAllWeekdaysOnly;
  }

  /**
   * Returns true if Sunday and Saturday selection are checked/ticked
   * See Day Enum for day index reference
   */
  public get isWeekends(): boolean {
    if (this.selectedScheduleDaysCount !== 2) {
      return false;
    }
    let selectedDays = this._scheduleDays.filter((scheduleDay) => {
      return this._dayFallsOnWeekends(scheduleDay.day) && scheduleDay.checked;
    });
    let hasAllWeekendsOnly = selectedDays.length === 2 && !this._isEveryday;
    return hasAllWeekendsOnly;
  }

  constructor(scheduleDays?: ScheduleDay[], time?: string, period?: string) {
    this._scheduleDays = scheduleDays ? scheduleDays : [
      { day: Day.Sunday, name: 'Sunday', checked: false },
      { day: Day.Monday, name: 'Monday', checked: false },
      { day: Day.Tuesday, name: 'Tuesday', checked: false },
      { day: Day.Wednesday, name: 'Wednesday', checked: false },
      { day: Day.Thursday, name: 'Thursday', checked: false },
      { day: Day.Friday, name: 'Friday', checked: false },
      { day: Day.Saturday, name: 'Saturday', checked: false },
    ];
    this._time = time;
    this._period = period;
  }

  /**
   * Tick all the days of the schedule days based on an array provided
   * @param days days index in an array
   */
  public setDays(...days: Day[]): void {
    this._scheduleDays.forEach((scheduleDay) => {
      scheduleDay.checked = !isNullOrUndefined(days.find((day) => (scheduleDay.day === +day)));
    });
  }

  /**
   * Tick all the days of the schedule days based on parameter provided
   * @param dayFrequency how often in a week, see DayFrequency enum for reference
   */
  public setDaysByFrequency(dayFrequency: DayFrequency): void {
    switch (dayFrequency) {
      case DayFrequency.Everyday:
        this._scheduleDays.forEach((scheduleDay) => scheduleDay.checked = true);

      case DayFrequency.Weekdays:
        this._scheduleDays.forEach((scheduleDay) => {
          scheduleDay.checked = false;
          if (this._dayFallsOnWeekdays(scheduleDay.day)) {
            scheduleDay.checked = true;
          }
        });
        break;

      case DayFrequency.Weekends:
        this._scheduleDays.forEach((selectionDay) => {
          selectionDay.checked = false;
          if (this._dayFallsOnWeekends(selectionDay.day)) {
            selectionDay.checked = true;
          }
        });
        break;
    }
  }

  /**
   * Unselect all or sets all the schedule days to false
   */
  public resetDays(): void {
    this._scheduleDays.forEach((selectionDay) => {
      selectionDay.checked = false;
    });
  }

  /**
   * Return an array of the values of the consolidated selected days
   */
  private _getSelectedScheduleDaysAsArray(): number[] {
    let days = [];
    this._scheduleDays.forEach((scheduleDay) => {
      if (scheduleDay.checked) {
        days.push(scheduleDay.day);
      }
    });
    return days;
  }

  /**
   * Filter all the selected schedule days
   */
  private _getSelectedScheduleDays(): ScheduleDay[] {
    return this._scheduleDays.filter((scheduleDay) => scheduleDay.checked);
  }

  /**
   * Returns true if the day is within Monday through Friday (1-5)
   * @param days day to be check
   */
  private _dayFallsOnWeekdays(day: number): boolean {
    return day >= 1 && day <= 5;
  }

  /**
   * Returns true if the day is Saturday or Sunday (0 or 6)
   * @param days day to be check
   */
  private _dayFallsOnWeekends(day: number): boolean {
    return day < 1 || day > 5;
  }
}
