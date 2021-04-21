import { Params } from '@angular/router';
import {
  isUrlValid,
  getHostName,
  getDomainName,
  convertUrlParamsKeyToLowerCase
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

  describe('convertUrlParamsKeyToLowerCase()', () => {
    it('should convert the url parameters key to lowercase', () => {
      let queryParams: Params = {
        serviceId: 'AZPCM1001',
        subscriptionName: 'subscription-name'
      }
      let convertedParams = convertUrlParamsKeyToLowerCase(queryParams);
      expect(convertedParams).toEqual({
        serviceid: 'AZPCM1001',
        subscriptionname: 'subscription-name'
      });
    });
  });
});
