import {
  buildCron,
  buildCronWeekly,
  parseCronStringToJson
} from './mcs-cron.function';

describe('Cron Utility Functions', () => {
  describe('buildCron()', () => {
    it(`should build the cron string based on passed cron config`, () => {
      let cronString = buildCron({
        minute: '7',
        hour: '4',
        dayMonth: '4',
        month: '2',
        dayWeek: '1'
      });
      expect(cronString).toEqual('7 4 4 2 1');
    });

    it(`should build the cron string even if minute is empty`, () => {
      let cronString = buildCron({
        hour: '4',
        dayMonth: '7',
        month: '2',
        dayWeek: '1'
      });
      expect(cronString).toEqual('* 4 7 2 1');
    });

    it(`should build the cron string even if hour is empty`, () => {
      let cronString = buildCron({
        minute: '7',
        dayMonth: '4',
        month: '2',
        dayWeek: '1'
      });
      expect(cronString).toEqual('7 * 4 2 1');
    });

    it(`should build the cron string even if dayMonth is empty`, () => {
      let cronString = buildCron({
        minute: '7',
        hour: '4',
        month: '2',
        dayWeek: '1'
      });
      expect(cronString).toEqual('7 4 * 2 1');
    });

    it(`should build the cron string even if month is empty`, () => {
      let cronString = buildCron({
        minute: '7',
        hour: '4',
        dayMonth: '2',
        dayWeek: '1'
      });
      expect(cronString).toEqual('7 4 2 * 1');
    });

    it(`should build the cron string even if dayWeek is empty`, () => {
      let cronString = buildCron({
        minute: '7',
        hour: '4',
        dayMonth: '4',
        month: '2'
      });
      expect(cronString).toEqual('7 4 4 2 *');
    });

    it(`should build the cron string even if the passed cron config fields are all empty`, () => {
      let cronString = buildCron({ });
      expect(cronString).toEqual('* * * * *');
    });
  });

  describe('buildCronWeekly()', () => {
    it(`should build the weekly cron string based on passed array of values`, () => {
      let cronString = buildCronWeekly([10], [5], [2, 5, 6]);
      expect(cronString).toEqual('10 5 * * 2,5,6');
    });

    it(`should throw an error when minute is empty`, () => {
      expect(
        () => { buildCronWeekly([], [4], [3, 4]); }
      ).toThrow(new Error('Invalid cron input'));
    });

    it(`should throw an error when hour is empty`, () => {
      expect(
        () => { buildCronWeekly([1], [], [3, 4]); }
      ).toThrow(new Error('Invalid cron input'));
    });

    it(`should throw an error when dayOfWeek is empty`, () => {
      expect(
        () => { buildCronWeekly([1], [4], []); }
      ).toThrow(new Error('Invalid cron input'));
    });

    it(`should throw an error when all of the parameters are empty`, () => {
      expect(
        () => { buildCronWeekly([], [], []); }
      ).toThrow(new Error('Invalid cron input'));
    });
  });

  describe('parseCronStringToJson()', () => {
    it(`should parse the passed cron string into json array`, () => {
      let jsonArray = parseCronStringToJson('5 4 3,4 6 1,2,4');

      expect(jsonArray.minute.length).toEqual(1);
      expect(jsonArray.minute.join(',')).toEqual('5');

      expect(jsonArray.hour.length).toEqual(1);
      expect(jsonArray.hour.join(',')).toEqual('4');

      expect(jsonArray.dayOfMonth.length).toEqual(2);
      expect(jsonArray.dayOfMonth.join(',')).toEqual('3,4');

      expect(jsonArray.month.length).toEqual(1);
      expect(jsonArray.month.join(',')).toEqual('6');

      expect(jsonArray.dayOfWeek.length).toEqual(3);
      expect(jsonArray.dayOfWeek.join(',')).toEqual('1,2,4');

    });
    it(`should parse the passed empty cron string into an empty json array`, () => {
      let jsonArray = parseCronStringToJson('');

      expect(jsonArray.minute.length).toEqual(0);
      expect(jsonArray.minute).toEqual([]);

      expect(jsonArray.hour.length).toEqual(0);
      expect(jsonArray.hour).toEqual([]);

      expect(jsonArray.dayOfMonth.length).toEqual(0);
      expect(jsonArray.dayOfMonth).toEqual([]);

      expect(jsonArray.month.length).toEqual(0);
      expect(jsonArray.month).toEqual([]);

      expect(jsonArray.dayOfWeek.length).toEqual(0);
      expect(jsonArray.dayOfWeek).toEqual([]);

    });

    it(`should parse the passed cron string with an asterisk dayOfWeek`, () => {
      let jsonArray = parseCronStringToJson('5 4 3,4 6 *');

      expect(jsonArray.minute.length).toEqual(1);
      expect(jsonArray.minute.join(',')).toEqual('5');

      expect(jsonArray.hour.length).toEqual(1);
      expect(jsonArray.hour.join(',')).toEqual('4');

      expect(jsonArray.dayOfMonth.length).toEqual(2);
      expect(jsonArray.dayOfMonth.join(',')).toEqual('3,4');

      expect(jsonArray.month.length).toEqual(1);
      expect(jsonArray.month.join(',')).toEqual('6');

      expect(jsonArray.dayOfWeek.length).toEqual(7);
      expect(jsonArray.dayOfWeek.join(',')).toEqual('0,1,2,3,4,5,6');

    });
  });
});
