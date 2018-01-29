import { Subscription } from 'rxjs/Rx';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from './mcs-object.function';

describe('OBJECT Functions', () => {
  describe('isNullOrEmpty()', () => {
    it('should return true if the inputted object is null', () => {
      let data: any = null;
      let isNull = isNullOrEmpty(data);
      expect(isNull).toBeTruthy();
    });

    it('should return true if the inputted object is undefine', () => {
      let data: any;
      let isNull = isNullOrEmpty(data);
      expect(isNull).toBeTruthy();
    });

    it('should return true if the Array object is empty', () => {
      let arrayObject: string[] = new Array();
      let isEmpty = isNullOrEmpty(arrayObject);
      expect(isEmpty).toBeTruthy();
    });

    it('should return true if the String object is empty', () => {
      let stringObject: string = '';
      let isEmpty = isNullOrEmpty(stringObject);
      expect(isEmpty).toBeTruthy();
    });

    it('should return false if the inputted object is not null/undefined', () => {
      let data: any = { something: '' };
      let isNull = isNullOrEmpty(data);
      expect(isNull).toBeFalsy();
    });

    it('should return false if the Array object is not null or empty', () => {
      let arrayObject: string[] = new Array();
      arrayObject.push('angular');
      let isNull = isNullOrEmpty(arrayObject);
      expect(isNull).toBeFalsy();
    });

    it('should return false if the String object is not null or empty', () => {
      let stringObject: string = 'angular';
      let isEmpty = isNullOrEmpty(stringObject);
      expect(isEmpty).toBeFalsy();
    });
  });

  describe('unsubscribeSafely()', () => {
    it('should close the subscription', () => {
      let subscription = new Subscription();
      expect(subscription.closed).toBeFalsy();
      unsubscribeSafely(subscription);
      expect(subscription.closed).toBeTruthy();
    });
  });
});
