import {
  isUrlValid,
  getHostName,
  getDomainName
} from './mcs-url.function';

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

  describe('getHostName()', () => {
    it('should return the host name of the given URL', () => {
      let hostName = getHostName('https://lab-portal.macquariecloudservices.com');
      expect(hostName).toBe('lab-portal.macquariecloudservices.com');
    });

    it('should return the host name of the given URL with parameters', () => {
      let hostName = getHostName('https://portal.macquariecloudservices.com/servers?id=1234');
      expect(hostName).toBe('portal.macquariecloudservices.com');
    });
  });

  describe('getDomainName()', () => {
    it('should return the domain name of the given URL', () => {
      let hostName = getDomainName('https://lab-portal.macquariecloudservices.com');
      expect(hostName).toBe('macquariecloudservices.com');
    });

    it('should return the domain name of the given URL with parameters', () => {
      let hostName = getDomainName('https://portal.macquariecloudservices.com/servers?id=1234');
      expect(hostName).toBe('macquariecloudservices.com');
    });
  });
});
