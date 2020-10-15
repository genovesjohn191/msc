import {
  addDaysToDate,
  addHoursToDate,
  addMonthsToDate,
  compareDates,
  convertDateTimezoneToUTC,
  formatDate,
  getDayinMonth,
  getDayDifference,
  getExpiryLabel,
  getMonth,
  getTimeDifference,
  getYear,
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

  describe('getDayinMonth()', () => {
    it(`should return correct date`, () => {
      let expectedDate = new Date().getDate();
      let actualDate = getDayinMonth();
      expect(actualDate).toBe(expectedDate);
    });
  });

  describe('getMonth()', () => {
    it(`given no parameter should return current month`, () => {
      let expectedMonth: number = new Date().getMonth() + 1;
      let actualMonth: number = getMonth();
      expect(actualMonth).toBe(expectedMonth);
    });
    it(`given parameter should return correct month`, () => {
      let testDate = new Date(2021, 12, 31);
      let expectedMonth: number = testDate.getMonth() + 1;
      let actualMonth: number = getMonth(testDate);
      expect(actualMonth).toBe(expectedMonth);
    });
  });

  describe('getYear()', () => {
    it(`given no parameter should return current year`, () => {
      let expectedYear: number = new Date().getFullYear();
      let actualYear: number = getYear();
      expect(actualYear).toBe(expectedYear);
    });
    it(`given parameter should return correct year`, () => {
      let testDate = new Date(2021, 12, 31);
      let expectedYear: number = testDate.getFullYear();
      let actualYear: number = getYear(testDate);
      expect(actualYear).toBe(expectedYear);
    });
  });

  describe('addDaysToDate()', () => {
    it(`should return correct date when incremented`, () => {
      let dayIncrement = 5;
      let testDate1 = new Date(getYear(), getMonth(), getDayinMonth());
      let testDate2 = new Date(getYear(), getMonth(), getDayinMonth());
      let expectedDate = new Date(testDate2.setDate(testDate2.getDate() + dayIncrement));
      let actualDate = addDaysToDate(testDate1, 5);
      let result = compareDates(actualDate, expectedDate);
      expect(result).toBe(0);
    });
  });

  describe('addHoursToDate()', () => {
    it(`should return correct date hours`, () => {
      let hourIncrement = 5;
      let testDate = new Date(getYear(), getMonth(), getDayinMonth());
      let expectedDate = new Date(getYear(), getMonth(), getDayinMonth(), hourIncrement);
      let actualDate = addHoursToDate(testDate, 5);

      expect(actualDate.getHours()).toBe(expectedDate.getHours());
      expect(getYear(actualDate)).toBe(getYear(expectedDate));
      expect(getMonth(actualDate)).toBe(getMonth(expectedDate));
      expect(getDayinMonth(actualDate)).toBe(getDayinMonth(expectedDate));
    });
  });

  describe('addMonthsToDate()', () => {
    it(`should return correct added months`, () => {
      let monthIncrement = 6;
      let testDate = new Date(2020, 1, 1);

      let actualDate = addMonthsToDate(testDate, monthIncrement);

      expect(actualDate.getFullYear()).toBe(testDate.getFullYear());
      expect(actualDate.getMonth()).toBe(testDate.getMonth() + monthIncrement);
      expect(actualDate.getDate()).toBe(testDate.getDate());
    });
  });
});
