import { Injector } from '@angular/core';
import {
  AbstractControl,
  FormGroup
} from '@angular/forms';

import { McsFormGroupService } from '../services/mcs-form-group.service';

export abstract class McsViewModelBase {
  public fgGroup: FormGroup;

  private readonly formGroupService: McsFormGroupService;

  constructor(injector: Injector) {
    this.formGroupService = injector.get<McsFormGroupService>(McsFormGroupService);
  }

  public registerControls(controls: { [key: string]: AbstractControl }): void {
    this.fgGroup = new FormGroup(controls);
  }

  public validate(host?: HTMLElement): boolean {
    this.formGroupService.touchAllFormFields(this.fgGroup);
    if (host) {
      this.formGroupService.scrollToFirstInvalidField(host);
    }

    return this.formGroupService.allFormFieldsValid(this.fgGroup);
  }

  public reset(): void {
    this.formGroupService.resetAllControls(this.fgGroup);
  }
}
