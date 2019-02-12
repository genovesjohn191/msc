import * as Cron from 'cron-converter';

type CronInfo = {
  minute: any[],
  hour: any[],
  dayOfMonth: any[],
  month: any[],
  dayOfWeek: any[],
};
// TODO : Unit test for this utility class
export class McsCronUtility {

  /**
   * Create the cron string with the proper format
   * @param minute minutes in string
   * @param hour hour in string (should be in 24 hour format)
   * @param dayOfMonth days of the month in string
   * @param month month/s in string
   * @param dayOfWeek comma separated days
   */
  public static buildCron(
    minute: number[],
    hour: number[],
    dayOfMonth: number[],
    month: number[],
    dayOfWeek: number[]
  ): string {

    let cronRequest = '';
    cronRequest += minute.join(',');
    cronRequest += ' ' + hour.join(',');
    cronRequest += ' ' + dayOfMonth.join(',');
    cronRequest += ' ' + month.join(',');
    cronRequest += ' ' + dayOfWeek.join(',');

    return cronRequest;
  }

  /**
   * Create a weekly cron string with the proper format
   * dayOfMonth and month are defaulted to any value
   * @param minute minutes in string
   * @param hour hour in string (should be in 24 hour format)
   * @param dayOfWeek comma separated days
   */
  public static buildCronWeekly(
    minute: number[] | string[],
    hour: number[] | string[],
    dayOfWeek: number[] | string[]
  ): string {

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
  public static parseCronStringToJson(cronString: string): CronInfo {
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

}
