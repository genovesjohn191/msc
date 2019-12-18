import {
  buildCronWeekly,
  parseCronStringToJson
} from './mcs-cron.function';

describe('Cron Utility Functions', () => {
  describe('buildCronWeekly()', () => {
    it(`should build the weekly cron string based on passed array of values`, () => {
      let cronString = buildCronWeekly([10], [5], [2, 5, 6]);
      expect(cronString).toEqual('10 5 * * 2,5,6');
    });

    it(`should throw error when one of the input is empty`, () => {
      expect(
        () => { buildCronWeekly([], [4], [3, 4]); }
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
  });
});
