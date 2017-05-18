import { formatDate } from './mcs-date.function';

describe('DATE Functions', () => {
  describe('formatDate()', () => {
    it(`should format the date based on the given string format`, () => {
      let unformattedDate = new Date('2017-04-26T01:55:12Z');

      let formattedDate = formatDate(unformattedDate, 'DD MMM, YYYY');
      expect(formattedDate).toEqual('26 Apr, 2017');
    });
  });
});
