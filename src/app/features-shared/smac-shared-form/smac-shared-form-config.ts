import { Injector } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { getSafeProperty } from '@app/utilities';
import {
  CoreValidators,
  McsAccessControlService
} from '@app/core';
import { McsApiService } from '@app/services';
import { map } from 'rxjs/operators';
import { McsAccount } from '@app/models';

const TEXTAREA_MAXLENGTH_DEFAULT = 850;

interface SmacSharedContactBase {
  isIncluded: boolean;
  placeholder?: string;
  label?: string;
  helpText?: string;
  validators?: ValidatorFn[];
}

interface SmacSharedContactConfig extends SmacSharedContactBase {
  phoneNumber?: string;
}

interface SmacSharedNotesConfig extends SmacSharedContactBase {
  maxlength?: number;
  isRequired?: boolean;
}

export class SmacSharedFormConfig {

  public get testCaseConfig(): SmacSharedContactBase {
    return this._testCaseConfig;
  }
  private _testCaseConfig: SmacSharedContactBase;

  public get notesConfig(): SmacSharedNotesConfig {
    return this._notesConfig;
  }
  private _notesConfig: SmacSharedNotesConfig;

  public get contactConfig(): SmacSharedContactConfig {
    return this._contactConfig;
  }
  private _contactConfig: SmacSharedContactConfig;

  public get customerReferenceConfig(): SmacSharedContactBase {
    return this._customerReferenceConfig;
  }
  private _customerReferenceConfig: SmacSharedContactBase;

  public get validatorsMap(): Map<string, ValidatorFn[]> {
    return this._validatorsMap;
  }
  private _validatorsMap: Map<string, ValidatorFn[]> = new Map();
  private _phoneNumber: string;
  private _translate: TranslateService;

  constructor(
    _injector: Injector,
    testCaseConfig?: SmacSharedContactBase,
    notesConfig?: SmacSharedNotesConfig,
    contactConfig?: SmacSharedContactConfig,
    customerReferenceConfig?: SmacSharedContactBase
  ) {
    this._translate = _injector.get(TranslateService);

    let testCaseIncluded = getSafeProperty(testCaseConfig, (obj) => obj.isIncluded, true);
    if (testCaseIncluded) {
      this._testCaseConfig = {
        isIncluded: testCaseIncluded,
        placeholder: getSafeProperty(testCaseConfig, (obj) => obj.placeholder,
          this._translate.instant('smacShared.form.testCases.placeholder')),
        label: getSafeProperty(testCaseConfig, (obj) => obj.label,
          this._translate.instant('smacShared.form.testCases.label')),
        helpText: getSafeProperty(testCaseConfig, (obj) => obj.helpText,
          this._translate.instant('smacShared.form.testCases.helpText')),
        validators: getSafeProperty(testCaseConfig, (obj) => obj.validators, [CoreValidators.rangeArray(0, 20)])
      };
      this._validatorsMap.set('fcTestCases', this.testCaseConfig.validators);
    }

    let notesIncluded = getSafeProperty(notesConfig, (obj) => obj.isIncluded, true);
    if (notesIncluded) {
      this._notesConfig = {
        isIncluded: notesIncluded,
        placeholder: getSafeProperty(notesConfig, (obj) => obj.placeholder,
          this._translate.instant('smacShared.form.notes.placeholder')),
        label: getSafeProperty(notesConfig, (obj) => obj.label,
          this._translate.instant('smacShared.form.notes.label')),
        helpText: getSafeProperty(notesConfig, (obj) => obj.helpText,
          this._translate.instant('smacShared.form.notes.helpText')),
        validators: getSafeProperty(notesConfig, (obj) => obj.validators, []),
        maxlength: getSafeProperty(notesConfig, (obj) => obj.maxlength, TEXTAREA_MAXLENGTH_DEFAULT),
        isRequired: getSafeProperty(notesConfig, (obj) => obj.isRequired, false)
      };
      this._validatorsMap.set('fcNotes', this.notesConfig.validators);
    }

    let contactIncluded = getSafeProperty(contactConfig, (obj) => obj.isIncluded, true);
    if (contactIncluded) {
      this._contactConfig = {
        isIncluded: contactIncluded,
        placeholder: getSafeProperty(contactConfig, (obj) => obj.placeholder,
          this._translate.instant('smacShared.form.contact.placeholder')),
        label: getSafeProperty(contactConfig, (obj) => obj.label,
          this._translate.instant('smacShared.form.contact.label')),
        validators: getSafeProperty(contactConfig, (obj) => obj.validators, [CoreValidators.required]),
        phoneNumber: getSafeProperty(contactConfig, (obj) => obj.phoneNumber, ''),
      };
      this._validatorsMap.set('fcContact', this.contactConfig.validators);
    }

    let customReferencetIncluded = getSafeProperty(customerReferenceConfig, (obj) => obj.isIncluded, true);
    if (customReferencetIncluded) {
      this._customerReferenceConfig = {
        isIncluded: customReferencetIncluded,
        placeholder: getSafeProperty(customerReferenceConfig, (obj) => obj.placeholder,
          this._translate.instant('smacShared.form.customerReference.placeholder')),
        label: getSafeProperty(customerReferenceConfig, (obj) => obj.label,
          this._translate.instant('smacShared.form.customerReference.label')),
        helpText: getSafeProperty(customerReferenceConfig, (obj) => obj.helpText,
          this._translate.instant('smacShared.form.customerReference.helpText')),
        validators: getSafeProperty(customerReferenceConfig, (obj) => obj.validators, [])
      };
      this._validatorsMap.set('fcCustomerReference', this.customerReferenceConfig.validators);
    }
  }
}
