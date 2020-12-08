import { FormControl, Validators } from '@angular/forms';
import { CoreValidators } from './core.validators';

describe(`Core Validators Tests`, () => {
  describe('FQDN Domain Validator', () => {
    it('should return null', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.setValue('ec2-35-160-210-253.us-west-2-.compute.amazonaws.com');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return null', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.setValue('-ec2_35$160%210-253.us-west-2-.compute.amazonaws.com');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return null', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.setValue('ec2-35-160-210-253.us-west-2-.compute.amazonaws.com.mx.gmail.com.');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return null', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.setValue('1.2.3.4.com');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return null', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.setValue('xn--d1aacihrobi6i.xn--p1ai');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return null', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.setValue('xn--kxae4bafwg.xn--pxaix.gr');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual(null);
    });

    it('should return fqdnDomain true', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.setValue('label.name.321');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual({ fqdnDomain: true });
    });

    it('should return fqdnDomain true', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.setValue('1234567890-1234567890-1234567890-1234567890-12345678901234567890.123.com');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual({ fqdnDomain: true });
    });

    it('should return fqdnDomain true', () => {
      let formControl = new FormControl('', Validators.required);
      formControl.setValue('1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.1234567890.com');
      let fqdnDomainValidator = CoreValidators.fqdnDomain(formControl);
      expect(fqdnDomainValidator).toEqual({ fqdnDomain: true });
    });
  });
});