import * as Cron from 'cron-converter';

import {
  isNullOrEmpty,
  isNullOrUndefined
} from './mcs-object.function';

type CronInfo = {
  minute: any[],
  hour: any[],
  dayOfMonth: any[],
  month: any[],
  dayOfWeek: any[],
};

export interface CronConfig {
  minute?: string;
  hour?: string;
  dayMonth?: string;
  month?: string;
  dayWeek?: string;
}

export function buildCron(config: CronConfig) {
  if (!config) { config = {}; }
  let cronMinute = isNullOrUndefined(config.minute) ? '*' : config.minute;
  let cronHour = isNullOrUndefined(config.hour) ? '*' : config.hour;
  let cronDayMonth = config.dayMonth || '*';
  let cronMonth = config.month || '*';
  let cronDayWeek = config.dayWeek || '*';

  let cronRequest: string = '';
  cronRequest = `${cronMinute} ${cronHour} ${cronDayMonth} ${cronMonth} ${cronDayWeek}`;
  return cronRequest;
}

/**
 * Create a weekly cron string with the proper format
 * dayOfMonth and month are defaulted to any value
 * @param minute minutes in string
 * @param hour hour in string (should be in 24 hour format)
 * @param dayOfWeek comma separated days
 */
export function buildCronWeekly(
  minute: number[] | string[],
  hour: number[] | string[],
  dayOfWeek: number[] | string[]
): string {

  if (isNullOrEmpty(minute) ||
    isNullOrEmpty(hour) ||
    isNullOrEmpty(dayOfWeek)) {
    throw new Error('Invalid cron input');
  }

  let cronRequest = '';
  cronRequest += minute.join(',');
  cronRequest += ' ' + hour.join(',');
  cronRequest += ' *'; // dayOfMonth
  cronRequest += ' *'; // month
  cronRequest += ' ' + dayOfWeek.join(',');

  return cronRequest;
}

/**
 * Convert a cron string to json
 * @param cronString cron formatted string
 */
export function parseCronStringToJson(cronString: string): CronInfo {
  let cronInstance = new Cron();
  if (!cronString) {
    return { minute: [], hour: [], dayOfMonth: [], month: [], dayOfWeek: [] };
  }
  let cronArray = cronInstance.fromString(cronString).toArray();
  return {
    minute: cronArray[0] ? cronArray[0] : [],
    hour: cronArray[1] ? cronArray[1] : [],
    dayOfMonth: cronArray[2] ? cronArray[2] : [],
    month: cronArray[3] ? cronArray[3] : [],
    dayOfWeek: cronArray[4] ? cronArray[4] : [],
  };
}
