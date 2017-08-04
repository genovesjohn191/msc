import {
  async,
  TestBed
} from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ValidationMessageComponent } from './validation-message.component';
import { ValidationMessageService } from './validation-message.service';
import { CoreValidators } from '../../core';

describe('ValidationMessageComponent', () => {

  /** Stub Services/Components */
  let component: ValidationMessageComponent;
  let mockValidationMessageService = {
    getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
      return validatorName;
    }
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ValidationMessageComponent
      ],
      providers: [
        { provide: ValidationMessageService, useValue: mockValidationMessageService }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ValidationMessageComponent, {
      set: {
        template: `<div>ValidationMessageComponent Template</div>`
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ValidationMessageComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('validationMessage()', () => {
    beforeEach(async(() => {
      component.control = new FormControl('', CoreValidators.required);
      component.control.setErrors({ required: true });
      component.control.markAsTouched();
    }));

    it('should get the validation message according to control', () => {
      let validationMessage = component.validationMessage;
      expect(validationMessage).toBeDefined();
    });
  });
});
