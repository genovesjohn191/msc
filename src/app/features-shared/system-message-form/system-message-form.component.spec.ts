
import { async,
  TestBed,
  getTestBed } from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';
import { compareDates } from '@app/utilities';
import { SystemMessageFormService } from './system-message-form.service';
import { FeaturesSharedModule } from '../features-shared.module';

describe(`System Message Form Method`, () => {
  let systemMessageFormService: SystemMessageFormService;
  beforeEach(async(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000;
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        FeaturesSharedModule,
        CoreTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      systemMessageFormService = getTestBed().get(SystemMessageFormService);
    });
  }));

  describe(`isGreaterThanPresentDate()`, () => {
    it(`should return true when expiry date is greater than present date`, () => {
      let expiryDate = '2019-12-01T12:00';
      let presentDate = '2019-11-01T12:00';

      let comparisonResult = compareDates(new Date(expiryDate), new Date(presentDate)) > 0;
      expect(comparisonResult).toBe(true);
    });

    it(`should return false when expiry date is null`, () => {
      let expiryDate = null;
      let presentDate = '2019-11-01T12:00';

      let comparisonResult = compareDates(new Date(expiryDate), new Date(presentDate)) > 0;
      expect(comparisonResult).toBe(false);
    });

    it(`should return false when expiry date is less than present date`, () => {
      let expiryDate = '2019-10-01T12:00';
      let presentDate = '2019-11-01T12:00';

      let comparisonResult = compareDates(new Date(expiryDate), new Date(presentDate)) > 0;
      expect(comparisonResult).toBe(false);
    });
  });

  describe(`hasPassedDateValidation()`, () => {
    it(`should return true when start and expiry dates are both null`, () => {
      let startDate = null;
      let expiryDate = null;
      let presentDate = '2019-10-01T12:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(true);
    });

    it(`should return false when start date is null(equal to current date) and expiry date is equal to present date`, () => {
      let startDate = '2019-09-09T10:00';
      let expiryDate = '2019-09-09T10:00';
      let presentDate = '2019-09-09T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(false);
    });

    it(`should return false when start date is null(equal to current date) and expiry date is earlier the present date`, () => {
      let startDate = '2019-09-09T10:00';
      let expiryDate = '2019-09-08T10:00';
      let presentDate = '2019-09-09T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(false);
    });

    it(`should return true when start date is null(equal to current date) and expiry date is later the present date`, () => {
      let startDate = '2019-09-09T10:00';
      let expiryDate = '2019-09-10T10:00';
      let presentDate = '2019-09-09T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(true);
    });

    it(`should return true when start date is equal to present date and expiry date is null`, () => {
      let expiryDate = null;
      let startDate = '2019-10-09T10:00';
      let presentDate = '2019-10-09T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(true);
    });

    it(`should return true when start date is earlier the present date and expiry date is null`, () => {
      let expiryDate = null;
      let startDate = '2019-10-08T10:00';
      let presentDate = '2019-10-09T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(true);
    });

    it(`should return true when start date is later the present date and expiry date is null`, () => {
      let expiryDate = null;
      let startDate = '2019-10-10T10:00';
      let presentDate = '2019-10-09T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(true);
    });

    it(`should return false when both start and expiry date are equal to present date`, () => {
      let startDate = '2019-11-09T10:00';
      let expiryDate = '2019-11-09T10:00';
      let presentDate = '2019-11-09T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(false);
    });

    it(`should return false when expiry is equal to present date and start is earlier than present date`, () => {
      let startDate = '2019-10-08T10:00';
      let expiryDate = '2019-11-08T10:00';
      let presentDate = '2019-11-08T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(false);
    });

    it(`should return false when expiry is equal to present date and start is later than present date`, () => {
      let startDate = '2019-12-10T10:00';
      let expiryDate = '2019-11-10T10:00';
      let presentDate = '2019-11-10T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(false);
    });

    it(`should return false when start is equal to present date and expiry is earlier than present date`, () => {
      let startDate = '2019-11-08T10:00';
      let expiryDate = '2019-10-08T10:00';
      let presentDate = '2019-11-08T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(false);
    });

    it(`should return true when start is equal to present date and expiry is later than present date`, () => {
      let startDate = '2019-11-10T10:00';
      let expiryDate = '2019-12-10T10:00';
      let presentDate = '2019-11-10T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(true);
    });

    it(`should return false when start is earlier the present date and expiry is earlier the present date`, () => {
      let startDate = '2019-06-10T10:00';
      let expiryDate = '2019-06-30T10:00';
      let presentDate = '2019-07-10T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(false);
    });

    it(`should return false when start is later the present date and expiry is earlier the present date`, () => {
      let startDate = '2019-08-10T10:00';
      let expiryDate = '2019-06-30T10:00';
      let presentDate = '2019-07-10T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(false);
    });

    it(`should return true when start is earlier the present date and expiry is later the present date`, () => {
      let startDate = '2019-06-10T10:00';
      let expiryDate = '2019-08-30T10:00';
      let presentDate = '2019-07-10T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(true);
    });

    it(`should return true when start is later the present date and expiry is later the present date`, () => {
      let startDate = '2019-07-30T10:00';
      let expiryDate = '2019-08-30T10:00';
      let presentDate = '2019-07-10T10:00';

      let dateValidationResult = systemMessageFormService.hasPassedDateValidation(startDate, expiryDate, presentDate);
      expect(dateValidationResult).toBe(true);
    });
  });
});
