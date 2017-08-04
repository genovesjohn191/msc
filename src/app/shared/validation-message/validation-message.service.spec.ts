import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ValidationMessageService } from './validation-message.service';
import { CoreTestingModule } from '../../core/testing';

describe('ValidationMessageService', () => {

  /** Stub Services/Components */
  let validationMessageService: ValidationMessageService;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        CoreTestingModule
      ],
      providers: [
        ValidationMessageService
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      validationMessageService = getTestBed().get(ValidationMessageService);
    });
  }));

  /** Test Implementation */
  describe('getValidatorErrorMessage()', () => {
    it(`should defined the validation message when the validator is ipAddress`, () => {
      let validationMessageDefined = validationMessageService
        .getValidatorErrorMessage('ipAddress');
      expect(validationMessageDefined).toBeDefined();
    });

    it(`should defined the validation message when the validator is numeric`, () => {
      let validationMessageDefined = validationMessageService
        .getValidatorErrorMessage('numeric');
      expect(validationMessageDefined).toBeDefined();
    });

    it(`should defined the validation message when the validator is required`, () => {
      let validationMessageDefined = validationMessageService
        .getValidatorErrorMessage('required');
      expect(validationMessageDefined).toBeDefined();
    });

    it(`should defined the validation message when the validator is email`, () => {
      let validationMessageDefined = validationMessageService
        .getValidatorErrorMessage('email');
      expect(validationMessageDefined).toBeDefined();
    });

    it(`should defined the validation message when the validator is pattern`, () => {
      let validationMessageDefined = validationMessageService
      .getValidatorErrorMessage('pattern');
      expect(validationMessageDefined).toBeDefined();
    });

    it(`should defined the validation message based on the value
    when the validator is minlength`, () => {
      let validationMessageDefined = validationMessageService
        .getValidatorErrorMessage('minlength', { requiredLength: 10 });
      expect(validationMessageDefined).toBeDefined();
    });

    it(`should defined the validation message based on the value
    when the validator is maxlength`, () => {
      let validationMessageDefined = validationMessageService
        .getValidatorErrorMessage('maxlength', { requiredLength: 10 });
      expect(validationMessageDefined).toBeDefined();
    });

    it(`should defined the validation message based on the value
    when the validator is min`, () => {
      let validationMessageDefined = validationMessageService
      .getValidatorErrorMessage('min', { min: 1 });
      expect(validationMessageDefined).toBeDefined();
    });

    it(`should defined the validation message based on the value
    when the validator is max`, () => {
      let validationMessageDefined = validationMessageService
        .getValidatorErrorMessage('max', { max: 10 });
      expect(validationMessageDefined).toBeDefined();
    });

    it(`should defined the validation message based on the value
    when the validator is custom`, () => {
      let validationMessageDefined = validationMessageService
        .getValidatorErrorMessage('custom', { message: 'sample' });
      expect(validationMessageDefined).toBeDefined('sample');
    });
  });

});
