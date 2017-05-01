import { isUrlValid } from './url.function';

describe('Url Functions', () => {
  describe('isUrlValid()', () => {
    it('should valid the inputted URL', () => {
      let urlValid = isUrlValid('https://www.google.com');
      expect(urlValid).toBeTruthy();
    });

    it('should not valid the inputted URL', () => {
      let urlNotValid = isUrlValid('www.empty-socket.trace@');
      expect(urlNotValid).toBeFalsy();
    });
  });
});
