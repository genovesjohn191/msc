import { Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  CoreValidators,
  McsViewModelBase
} from '@app/core';

export class FeedbackSheetViewModel extends McsViewModelBase {
  public fcExperience: FormControl;
  public fcCanEmail: FormControl;

  constructor(injector: Injector) {
    super(injector);

    this.fcExperience = new FormControl('', [
      CoreValidators.required
    ]);
    this.fcCanEmail = new FormControl('');

    this.registerControls({
      fcExperience: this.fcExperience,
      fcCanEmail: this.fcCanEmail
    });
  }
}
