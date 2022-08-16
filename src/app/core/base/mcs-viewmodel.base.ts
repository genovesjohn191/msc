import { Injector } from '@angular/core';
import {
  AbstractControl,
  FormGroup
} from '@angular/forms';

import { McsFormGroupService } from '../services/mcs-form-group.service';

export abstract class McsViewModelBase {
  public formGroup: FormGroup;

  private readonly formGroupService: McsFormGroupService;

  constructor(injector: Injector) {
    this.formGroupService = injector.get<McsFormGroupService>(McsFormGroupService);
  }

  public get valid(): boolean {
    return this.formGroupService.allFormFieldsValid(this.formGroup);
  }

  public registerControls(controls: { [key: string]: AbstractControl }): void {
    this.formGroup = new FormGroup(controls);
  }

  public validate(host?: HTMLElement): boolean {
    this.formGroupService.touchAllFormFields(this.formGroup);
    if (host) {
      this.formGroupService.scrollToFirstInvalidField(host);
    }
    return this.formGroupService.allFormFieldsValid(this.formGroup);
  }

  public reset(): void {
    this.formGroupService.resetAllControls(this.formGroup);
  }
}
