import { McsCronUtility } from './mcs-cron-utility';

describe('Cron Utility Functions', () => {
  describe('buildCron()', () => {
    it(`should build the cron string based on passed array of values`, () => {
      let cronString = McsCronUtility.buildCron([10], [5], [2], [4], [3, 4]);
      expect(cronString).toEqual('10 5 2 4 3,4');
    });

    it(`should throw error when one of the input is empty`, () => {
      expect(
        () => { McsCronUtility.buildCron([], [5], [2], [4], [3, 4]); }
      ).toThrow(new Error('Invalid cron input'));
    });
  });

  describe('buildCronWeekly()', () => {
    it(`should build the weekly cron string based on passed array of values`, () => {
      let cronString = McsCronUtility.buildCronWeekly([10], [5], [2, 5, 6]);
      expect(cronString).toEqual('10 5 * * 2,5,6');
    });

    it(`should throw error when one of the input is empty`, () => {
      expect(
        () => { McsCronUtility.buildCronWeekly([], [4], [3, 4]); }
      ).toThrow(new Error('Invalid cron input'));
    });
  });

  describe('parseCronStringToJson()', () => {
    it(`should parse the passed cron string into json array`, () => {
      let jsonArray = McsCronUtility.parseCronStringToJson('5 4 3,4 6 1,2,4');

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
  });
});
