import { FormControl, Validators } from '@angular/forms';
import { CoreValidators } from './core.validators';

describe(`Core Validators Tests`, () => {
  describe('IP Address Validator', () => {
    it('should return null given valid ip address', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('100.40.1.1');
      let ipAddressValidator = CoreValidators.ipAddress(formControl);
      expect(ipAddressValidator).toEqual(null);
    });

    it('should return null given valid ip address', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('1.1.1.1');
      let ipAddressValidator = CoreValidators.ipAddress(formControl);
      expect(ipAddressValidator).toEqual(null);
    });

    it('should return ipAddress true given invalid ip address exceeded range', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('256.302.50.6');
      let ipAddressValidator = CoreValidators.ipAddress(formControl);
      expect(ipAddressValidator).toEqual({ ipAddress: true });
    });

    it('should return ipAddress true given invalid ip address', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('this is an invalid ip address');
      let ipAddressValidator = CoreValidators.ipAddress(formControl);
      expect(ipAddressValidator).toEqual({ ipAddress: true });
    });
  });

  describe('IP Address Shorthand Mask Validator', () => {
    it('should return null given valid shorthand mask', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('100.40.1.1');
      let ipShorthandMaskValidator = CoreValidators.ipAddressShortHandMask(formControl);
      expect(ipShorthandMaskValidator).toEqual(null);
    });

    it('should return ipAddressShortHandMask true given invalid IP shorthand mask', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('100.40.1.1/32');
      let ipShorthandMaskValidator = CoreValidators.ipAddressShortHandMask(formControl);
      expect(ipShorthandMaskValidator).toEqual(null);
    });

    it('should return ipAddressShortHandMask true given invalid IP shorthand mask', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('100.40.1.1/34');
      let ipShorthandMaskValidator = CoreValidators.ipAddressShortHandMask(formControl);
      expect(ipShorthandMaskValidator).toEqual({ ipAddressShortHandMask: true });
    });

    it('should return ipAddressShortHandMask true given invalid IP invalid shorthan mask', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('this is an invalid ip shorthand mask');
      let ipShorthandMaskValidator = CoreValidators.ipAddressShortHandMask(formControl);
      expect(ipShorthandMaskValidator).toEqual({ ipAddressShortHandMask: true });
    });
  });

  describe('Hostname Validator', () => {
    it('should return null given valid host name', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('MT00148PH');
      let hostNameValidator = CoreValidators.hostName(formControl);
      expect(hostNameValidator).toEqual(null);
    });

    it('should return hostName true given valid host name', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('505-samplehost');
      let hostNameValidator = CoreValidators.hostName(formControl);
      expect(hostNameValidator).toEqual(null);
    });

    it('should return hostName true given valid host name', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('-505-samplehost');
      let hostNameValidator = CoreValidators.hostName(formControl);
      expect(hostNameValidator).toEqual({ hostName: true });
    });

    it('should return hostName true given invalid host name', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('505-samplehost/');
      let hostNameValidator = CoreValidators.hostName(formControl);
      expect(hostNameValidator).toEqual({ hostName: true });
    });
  });

  describe('Numeric Validator', () => {
    it('should return null given valid numeric', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('1250501');
      let numericValidator = CoreValidators.numeric(formControl);
      expect(numericValidator).toEqual(null);
    });

    it('should return null given valid numeric', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('0');
      let numericValidator = CoreValidators.numeric(formControl);
      expect(numericValidator).toEqual(null);
    });

    it('should return null given valid numeric', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('-50');
      let numericValidator = CoreValidators.numeric(formControl);
      expect(numericValidator).toEqual(null);
    });

    it('should return numeric true given invalid host name', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('0.0');
      let numericValidator = CoreValidators.numeric(formControl);
      expect(numericValidator).toEqual({ numeric: true });
    });

    it('should return numeric true given invalid host name', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('50.00');
      let numericValidator = CoreValidators.numeric(formControl);
      expect(numericValidator).toEqual({ numeric: true });
    });

    it('should return numeric true given invalid host name', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('505-samplehost/');
      let numericValidator = CoreValidators.numeric(formControl);
      expect(numericValidator).toEqual({ numeric: true });
    });
  });

  describe('Decimal Validator', () => {
    it('should return null given valid decimal value', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('50.45');
      let decimalValidator = CoreValidators.decimal(formControl);
      expect(decimalValidator).toEqual(null);
    });

    it('should return null given valid decimal value', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('-50.45787');
      let decimalValidator = CoreValidators.decimal(formControl);
      expect(decimalValidator).toEqual(null);
    });

    it('should return null given valid decimal value', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('.45');
      let decimalValidator = CoreValidators.decimal(formControl);
      expect(decimalValidator).toEqual(null);
    });

    it('should return null given valid decimal value', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('0');
      let decimalValidator = CoreValidators.decimal(formControl);
      expect(decimalValidator).toEqual(null);
    });

    it('should return decimal true given invalid decimal value', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('50.');
      let decimalValidator = CoreValidators.decimal(formControl);
      expect(decimalValidator).toEqual({ decimal: true });
    });

    it('should return decimal true given invalid decimal value', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('50b');
      let decimalValidator = CoreValidators.decimal(formControl);
      expect(decimalValidator).toEqual({ decimal: true });
    });
  });

  describe('Alpha Numeric Validator', () => {
    it('should return null given valid alpha numeric value', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('sample50b');
      let alphaNumericValidator = CoreValidators.alphaNumeric(formControl);
      expect(alphaNumericValidator).toEqual(null);
    });

    it('should return null given valid alpha numeric value', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('0test');
      let alphaNumericValidator = CoreValidators.alphaNumeric(formControl);
      expect(alphaNumericValidator).toEqual(null);
    });

    it('should return alphaNumeric true given invalid alpha numeric value', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('sample-0');
      let alphaNumericValidator = CoreValidators.alphaNumeric(formControl);
      expect(alphaNumericValidator).toEqual({ alphaNumeric: true });
    });

    it('should return alphaNumeric true given invalid alpha numeric value', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('sample/0');
      let alphaNumericValidator = CoreValidators.alphaNumeric(formControl);
      expect(alphaNumericValidator).toEqual({ alphaNumeric: true });
    });
  });

  describe('Required Validator', () => {
    it('should return null given value isnt empty', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('sample-string 02 /');
      let requiredValidator = CoreValidators.required(formControl);
      expect(requiredValidator).toEqual(null);
    });

    it('should return required true given value is null', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue(null);
      let requiredValidator = CoreValidators.required(formControl);
      expect(requiredValidator).toEqual({ 'required': true });
    });

    it('should return required true given value is empty', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('');
      let requiredValidator = CoreValidators.required(formControl);
      expect(requiredValidator).toEqual({ 'required': true });
    });

    it('should return required true given value is empty', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue(' ');
      let requiredValidator = CoreValidators.required(formControl);
      expect(requiredValidator).toEqual({ 'required': true });
    });

    it('should return required true given value is undefined', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue(undefined);
      let requiredValidator = CoreValidators.required(formControl);
      expect(requiredValidator).toEqual({ 'required': true });
    });
  });

  describe('Url Validator', () => {
    it('should return null given valid url', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('https://www.macquarietelecom.com');
      let urlValidator = CoreValidators.url(formControl);
      expect(urlValidator).toEqual(null);
    });

    it('should return null given valid url', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('http://macquarietelecom.com');
      let urlValidator = CoreValidators.url(formControl);
      expect(urlValidator).toEqual(null);
    });


    it('should return null given valid url', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('ftp://myname@host.com');
      let urlValidator = CoreValidators.url(formControl);
      expect(urlValidator).toEqual(null);
    });

    it('should return url true given invalid url', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('myname@host.com');
      let urlValidator = CoreValidators.url(formControl);
      expect(urlValidator).toEqual({ url: true });
    });
  });

  describe('Domain Validator', () => {
    it('should return null given valid domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('macquarietelecom.com');
      let domainValidator = CoreValidators.domain(formControl);
      expect(domainValidator).toEqual(null);
    });

    it('should return null given valid domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('xn--kxae4bafwg.xn--pxaix.gr');
      let domainValidator = CoreValidators.domain(formControl);
      expect(domainValidator).toEqual(null);
    });

    it('should return domain true given invalid domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('ec2-35-160-210-253.us-west-2-.compute.amazonaws.com');
      let domainValidator = CoreValidators.domain(formControl);
      expect(domainValidator).toEqual({ domain: true });
    });

    it('should return domain true given invalid domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('1.2.3.4.com');
      let domainValidator = CoreValidators.domain(formControl);
      expect(domainValidator).toEqual({ domain: true });
    });

    it('should return domain true given invalid domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('1234567890-1234567890-1234567890-1234567890-12345678901234567890.123.com');
      let domainValidator = CoreValidators.domain(formControl);
      expect(domainValidator).toEqual({ domain: true });
    });
  });

  describe('FQDN Domain Validator', () => {
    it('should return null given valid fqdn domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('ec2-35-160-210-253.us-west-2-.compute.amazonaws.com');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return null given valid fqdn domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('-ec2_35$160%210-253.us-west-2-.compute.amazonaws.com');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return null given valid fqdn domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('ec2-35-160-210-253.us-west-2-.compute.amazonaws.com.mx.gmail.com.');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return null given valid fqdn domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('1.2.3.4.com');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return null given valid fqdn domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('xn--d1aacihrobi6i.xn--p1ai');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return null given valid fqdn domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('xn--kxae4bafwg.xn--pxaix.gr');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return fqdnDomain true given invalid fqdn domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('label.name.321');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual({ fqdnDomain: true });
    });

    it('should return fqdnDomain true given invalid fqdn domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('1234567890-1234567890-1234567890-1234567890-12345678901234567890.123.com');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual({ fqdnDomain: true });
    });

    it('should return fqdnDomain true given invalid fqdn domain input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.com');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual({ fqdnDomain: true });
    });
  });

  describe('Email Validator', () => {
    it('should return null given valid email input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('niceandsimple@example.com');
      let emailValidator = CoreValidators.email(formControl);
      expect(emailValidator).toEqual(null);
    });

    it('should return null given valid email input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('other.email-with-dash@example.com');
      let emailValidator = CoreValidators.email(formControl);
      expect(emailValidator).toEqual(null);
    });

    it('should return null given valid email input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('" "@example.org');
      let emailValidator = CoreValidators.email(formControl);
      expect(emailValidator).toEqual({ email: true });
    });

    it('should return null given valid email input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('"very.(),:;<>[]".VERY."very@\ "very".unusual"@strange.example.com');
      let emailValidator = CoreValidators.email(formControl);
      expect(emailValidator).toEqual({ email: true });
    });

    it('should return email true given invalid email input', () => {
      let formControl = new FormControl<any>('', Validators.required);
      formControl.setValue('"!#$%&*+-/=?^_{}`|~@example.org"');
      let emailValidator = CoreValidators.email(formControl);
      expect(emailValidator).toEqual({ email: true });
    });
  });
});