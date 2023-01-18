import moment from 'moment';
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
  isDateFormatValid,
  getFriendlyTimespan,
  formatDateTimeZone,
  formatTime,
  getCurrentDate,
  getFirstDateOfTheWeek,
  getFirstDateOfTheMonth,
  getFirstDateOfTheYear,
  getDateOnly,
  getTimestamp,
  setDateToFirstDayOftheMonth,
  setDateToLastDayOftheMonth,
  addYearsToDate,
  getLastDateOfThePreviousYear,
  getFriendlyDay
} from './mcs-date.function';

describe('DATE Functions', () => {
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

  describe('getFriendlyTimespan()', () => {
    it(`should convert days correctly`, () => {
      let timespan = getFriendlyTimespan(106400 * 1000);
      expect(timespan).toEqual('1d 5h');
    });

    it(`should convert hours correctly`, () => {
      let timespan = getFriendlyTimespan(12503 * 1000);
      expect(timespan).toEqual('3h 28m');
    });

    it(`should convert minutes correctly`, () => {
      let timespan = getFriendlyTimespan(129 * 1000);
      expect(timespan).toEqual('2m 9s');
    });

    it(`should convert seconds correctly`, () => {
      let timespan = getFriendlyTimespan(50 * 1000);
      expect(timespan).toEqual('50s');
    });

    it(`should round up if less than a second`, () => {
      let timespan = getFriendlyTimespan(500);
      expect(timespan).toEqual('1s');
    });

    it(`should return empty for negative parameter`, () => {
      let timespan = getFriendlyTimespan(-1);
      expect(timespan).toEqual('');
    });

    it(`should return empty for empty or null parameter`, () => {
      let timespan = getFriendlyTimespan(null);
      expect(timespan).toEqual('');
    });
  });

  describe('getFriendlyDay()', () => {
    it(`should return empty for empty or null parameter`, () => {
      let day = getFriendlyDay(null);
      expect(day).toEqual('');
    });

    it(`should return 'Today' if date is today`, () => {
      let currentDate = new Date();
      let day = getFriendlyDay(currentDate);
      expect(day).toEqual('Today');
    });

    it(`should return 'Yesterday' if date is a day before`, () => {
      let date = new Date();
      date.setDate(date.getDate() - 1);
      let day = getFriendlyDay(date);
      expect(day).toEqual('Yesterday');
    });

    it(`should return the day if date is more than 2 days but less than 7 days`, () => {
      let date = new Date();
      date.setDate(date.getDate() - 3);
      let day = getFriendlyDay(date);
      expect(day).toEqual(moment(date).format('dddd'));
    });

    
    it(`should return the date if equal or more than 7 days`, () => {
      let date = new Date();
      date.setDate(date.getDate() - 7);
      let day = getFriendlyDay(date);
      expect(day).toEqual(moment(date).format('ddd, DD MMM YYYY'));
    });
  })

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

  describe('formatTime()', () => {
    it(`should format the time based on the given string format`, () => {

      let formattedDate = formatTime('03:30', 'HH:mm', 'h:mm A');
      expect(formattedDate).toEqual('3:30 AM');
    });
    it(`should format to default time if the outputFormat is empty`, () => {

      let formattedDate = formatTime('03:30', 'HH:mm');
      expect(formattedDate).toEqual('03:30');
    });
    it(`should return an empty string if the given time is empty`, () => {

      let formattedDate = formatTime('', 'HH:mm', 'h:mm A');
      expect(formattedDate).toEqual('');
    });
  });

  describe('getCurrentDate()', () => {
    it(`should return the current date`, () => {

      let formattedDate = getCurrentDate();
      expect(formattedDate).toEqual(new Date());
    });
  });

  describe('getDayinMonth()', () => {
    it(`should return correct date`, () => {
      let expectedDate = new Date().getDate();
      let actualDate = getDayinMonth();
      expect(actualDate).toBe(expectedDate);
    });
    it(`given no parameter should return current day of the month`, () => {
      let expectedMonth: number = new Date().getDate();
      let actualMonth: number = getDayinMonth();
      expect(actualMonth).toBe(expectedMonth);
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

  describe('getFirstDateOfTheWeek()', () => {
    it(`given no parameter should return the first date of the week`, () => {
      let expectedDay: number = new Date().getDate() - new Date().getDay();
      let actualDay: number = getFirstDateOfTheWeek();
      expect(actualDay).toBe(expectedDay);
    });
    it(`given parameter should return the first date of the given week`, () => {
      let testDate = new Date(2022, 7, 11);
      let expectedDay: number = testDate.getDate() - testDate.getDay();
      let actualDay: number = getFirstDateOfTheWeek(testDate);
      expect(actualDay).toBe(expectedDay);
    });
  });

  describe('getFirstDateOfTheMonth()', () => {
    it(`given no parameter should return the first date of the month`, () => {
      let expectedDay = (date: Date = new Date()) => {
        return date.getFullYear(), date.getMonth(), 1;
      };
      let actualDay: number = getFirstDateOfTheMonth(new Date());
      expect(actualDay).toBe(expectedDay());
    });
    it(`given parameter should return the first date of the given month`, () => {
      let expectedDay = (date: Date = new Date(2022, 7, 11)) => {
        return date.getFullYear(), date.getMonth(), 1;
      };
      let actualDay: number = getFirstDateOfTheMonth(new Date(2022, 7, 11));
      expect(actualDay).toEqual(expectedDay());
    });
  });

  describe('getFirstDateOfTheYear()', () => {
    it(`given no parameter should return the first date of the year`, () => {
      let expectedDay = (date: Date = new Date()) => {
        return new Date(date.getFullYear(), 0, 1);
      };
      let actualDay: Date = getFirstDateOfTheYear(new Date());
      expect(actualDay).toEqual(expectedDay());
    });
    it(`given parameter should return the first date of the given year`, () => {
      let expectedDay = (date: Date = new Date(2022, 7, 11)) => {
        return new Date(date.getFullYear(), 0, 1);
      };
      let actualDay: Date = getFirstDateOfTheYear(new Date(2022, 7, 11));
      expect(actualDay).toEqual(expectedDay());
    });
  });

  describe('getLastDateOfThePreviousYear()', () => {
    it(`given no parameter should return the last date of the previous year`, () => {
      let expectedDay = (date: Date = new Date()) => {
        return new Date(date.getFullYear() - 1, 11, 31);
      };
      let actualDay: Date = getLastDateOfThePreviousYear(new Date());
      expect(actualDay).toEqual(expectedDay());
    });
    it(`given parameter should return the last date of the previous given year`, () => {
      let expectedDay = (date: Date = new Date(2022, 7, 11)) => {
        return new Date(date.getFullYear() - 1, 11, 31);
      };
      let actualDay: Date = getLastDateOfThePreviousYear(new Date(2022, 7, 11));
      expect(actualDay).toEqual(expectedDay());
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

  describe('addYearsToDate()', () => {
    it(`should return correct added years`, () => {
      let yearIncrement = 5;
      let testDate = new Date(2020, 1, 1);

      let actualDate = addYearsToDate(testDate, yearIncrement);

      expect(actualDate.getFullYear()).toBe(testDate.getFullYear() + yearIncrement);
      expect(actualDate.getMonth()).toBe(testDate.getMonth());
      expect(actualDate.getDate()).toBe(testDate.getDate());
    });
  });

  describe('getDateOnly()', () => {
    it(`should return correct date only from the given input excluding the time settings`, () => {
      let testDate = new Date("Mon Jul 11 2022 15:07:11 GMT+0800");
      testDate.setSeconds(0);
      testDate.setMinutes(0);
      testDate.setHours(0);

      let actualDate = getDateOnly(testDate);

      expect(actualDate.getHours()).toBe(testDate.getHours());
      expect(actualDate.getMinutes()).toBe(testDate.getMinutes());
      expect(actualDate.getSeconds()).toBe(testDate.getSeconds());
      expect(actualDate.getDate()).toBe(testDate.getDate());
    });
  });

  describe('getTimestamp()', () => {
    it(`should return the timestamp in seconds`, () => {
      let testDate = new Date("Mon Jul 11 2022 15:07:11 GMT+0800").getTime();

      let actualDate = getTimestamp(new Date("Mon Jul 11 2022 15:07:11 GMT+0800"));

      expect(actualDate).toBe(testDate);
    });
  });

  describe('setDateToFirstDayOftheMonth()', () => {
    it(`should return the first day of the month`, () => {
      let testDate = (date: Date = new Date("Mon Jul 11 2022 15:07:11 GMT+0800")) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
      };

      let actualDate = setDateToFirstDayOftheMonth(new Date("Mon Jul 11 2022 15:07:11 GMT+0800"));

      expect(actualDate).toEqual(testDate());
    });
  });

  describe('setDateToLastDayOftheMonth()', () => {
    it(`should return the last day of the month`, () => {
      let testDate = (date: Date = new Date("Mon Jul 11 2022 15:07:11 GMT+0800")) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
      };

      let actualDate = setDateToLastDayOftheMonth(new Date("Mon Jul 11 2022 15:07:11 GMT+0800"));

      expect(actualDate).toEqual(testDate());
    });
  });
});
