import { fakeAsync } from '@angular/core/testing';
import { createRandomString } from './mcs-crypto.function';

// Dummy class
export class TestStructure {
  public executeProcess(): void {
    // Do something
  }
}

describe('Cryptography utility functions', () => {
  describe('createRandomString()', () => {
    it(`should create random string with correct length`, fakeAsync(() => {
      let randomString = createRandomString(1, 1 , 1, 0);
      expect(randomString.length).toBe(3);

      randomString = createRandomString(1, 1 , 1, 2);
      expect(randomString.length).toBe(5);

      randomString = createRandomString(1, 1 , 1, 6);
      expect(randomString.length).toBe(9);

      randomString = createRandomString(-1, -1 , -1, -1);
      expect(randomString.length).toBe(0);
    }));

    it(`should create random string with correct strict requirements`, fakeAsync(() => {
      const chars = [
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', // letters
        '0123456789', // numbers
        '~!@#$%^&*(){}[]', // special characters
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*(){}[]' // either
      ];

      let expectedLetterCount = 3;
      let expectedNumberCount = 2;
      let expectedSpecialCount = 5;


      let randomString = createRandomString(expectedLetterCount, expectedNumberCount , expectedSpecialCount, 0);
      let letterCount = 0;
      let numberCount = 0;
      let specialCount = 0;

      let randomCharArray = randomString.split('');

      randomCharArray.forEach((char) => {
        if (chars[0].indexOf(char) > -1) {
          letterCount++;
        }

        if (chars[1].indexOf(char) > -1) {
          numberCount++;
        }

        if (chars[2].indexOf(char) > -1) {
          specialCount++;
        }
      } );

      expect(letterCount).toBe(expectedLetterCount);
      expect(numberCount).toBe(expectedNumberCount);
      expect(specialCount).toBe(expectedSpecialCount);
    }));

    it(`should create random string with correct loose requirements`, fakeAsync(() => {
      const chars = [
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', // letters
        '0123456789', // numbers
        '~!@#$%^&*(){}[]', // special characters
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*(){}[]' // either
      ];

      let expectedLetterCount = 5;
      let expectedNumberCount = 1;
      let expectedSpecialCount = 1;
      let expectedAny = 5;


      let randomString = createRandomString(expectedLetterCount, expectedNumberCount , expectedSpecialCount, expectedAny);
      let letterCount = 0;
      let numberCount = 0;
      let specialCount = 0;

      let randomCharArray = randomString.split('');

      randomCharArray.forEach((char) => {
        if (chars[0].indexOf(char) > -1) {
          letterCount++;
        }

        if (chars[1].indexOf(char) > -1) {
          numberCount++;
        }

        if (chars[2].indexOf(char) > -1) {
          specialCount++;
        }
      } );

      expect(randomString.length - expectedAny).toBe(expectedLetterCount + expectedNumberCount + expectedSpecialCount);
      expect(letterCount).toBeGreaterThanOrEqual(expectedLetterCount);
      expect(numberCount).toBeGreaterThanOrEqual(expectedNumberCount);
      expect(specialCount).toBeGreaterThanOrEqual(expectedSpecialCount);
    }));
  });
});
