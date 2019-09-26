import {
  formatDate,
  getTimeDifference,
  getDayDifference,
  compareDates,
  getExpiryLabel,
  convertDateTimezoneToUTC,
  isDateFormatValid
} from './mcs-date.function';

describe('DATE Functions', () => {
  describe('formatDate()', () => {
    it(`should format the date based on the given string format`, () => {
      let unformattedDate = new Date('2017-04-26T01:55:12Z');

      let formattedDate = formatDate(unformattedDate, 'DD MMM, YYYY');
      expect(formattedDate).toEqual('26 Apr, 2017');
    });
  });

  describe('convertDateTimezoneToUTC()', () => {
    it(`should convert date timezone`, () => {
      let localDateTime = '2019-09-10T10:00:00';

      let convertedDateTimezone = convertDateTimezoneToUTC(
        localDateTime, 'Australia/Sydney', `yyyy-MM-dd'T'HH:mm:ss z`
      );
      expect(convertedDateTimezone.toString()).toEqual('2019-09-10T00:00:00.000Z');
    });
  });

  describe('isDateFormatValid()', () => {
    it(`should return true when the format of the date is same as the given format`, () => {
      let localDateTime = '2019-09-10T10:00';

      let validatedDateFormat = isDateFormatValid(localDateTime, 'YYYY-MM-DDTHH:mm');
      expect(validatedDateFormat).toEqual(true);
    });
    it(`should return false when the format of the date is not same as the given format`, () => {
      let localDateTime = 'Tue, 16 Jul 2019, 8:30 AM';

      let validatedDateFormat = isDateFormatValid(localDateTime, 'YYYY-MM-DDTHH:mm');
      expect(validatedDateFormat).toEqual(false);
    });
  });

  describe('getTimeDifference()', () => {
    it(`should get the correct time difference of 2 dates in milliseconds`, () => {
      let firstDate = new Date('2017-04-26 01:10:45');
      let secondDate = new Date('2017-04-26 01:10:50');

      let timeDifference = getTimeDifference(firstDate, secondDate);
      expect(timeDifference).toEqual(5000);
    });

    it(`should get the wrong time difference of 2 dates in milliseconds`, () => {
      let firstDate = new Date('2017-04-26 01:10:45');
      let secondDate = new Date('2017-04-26 01:10:55');

      let timeDifference = getTimeDifference(firstDate, secondDate);
      expect(timeDifference).not.toEqual(15000);
      expect(timeDifference).toEqual(10000);
    });
  });

  describe('getDayDifference()', () => {
    it(`should get the correct day difference of 2 dates`, () => {
      let firstDate = new Date('2017-04-26 01:10:45');
      let secondDate = new Date('2017-04-27 01:10:45');

      let dayDifference = getDayDifference(firstDate, secondDate);
      expect(dayDifference).toEqual(1);
    });

    it(`should get the wrong day difference of 2 dates`, () => {
      let firstDate = new Date('2017-04-26 01:10:45');
      let secondDate = new Date('2017-04-30 01:10:45');

      let dayDifference = getDayDifference(firstDate, secondDate);
      expect(dayDifference).not.toBe(5);
      expect(dayDifference).toEqual(4);
    });
  });

  describe('compareDates()', () => {
    it(`should return 1 when the first date is newer than second date`, () => {
      let firstDate = new Date('2017-04-27 01:10:45');
      let secondDate = new Date('2017-04-26 01:10:45');

      let compareValue = compareDates(firstDate, secondDate);
      expect(compareValue).toEqual(1);
    });

    it(`should return 0 when the second date and first date are the same`, () => {
      let firstDate = new Date('2017-04-27 01:10:45');
      let secondDate = new Date('2017-04-27 01:10:45');

      let compareValue = compareDates(firstDate, secondDate);
      expect(compareValue).toEqual(0);
    });

    it(`should return -1 when the second date is newer than first date`, () => {
      let firstDate = new Date('2017-04-26 01:10:45');
      let secondDate = new Date('2017-04-27 01:10:45');

      let compareValue = compareDates(firstDate, secondDate);
      expect(compareValue).toEqual(-1);
    });
  });

  describe('getExpiryLabel()', () => {
    it(`should return Expires if the date is not yet expired`, () => {
      let expiry = new Date('2017-12-26 01:10:45');
      let expiresLabel = getExpiryLabel(expiry);
      expect(expiresLabel).toBe(getExpiryLabel(expiry));
    });

    it(`should return Expired if the date is already expired`, () => {
      let expiry = new Date('2017-04-26 01:10:45');
      let expiredLabel = getExpiryLabel(expiry);
      expect(expiredLabel).toBe(getExpiryLabel(expiry));
    });
  });
});
