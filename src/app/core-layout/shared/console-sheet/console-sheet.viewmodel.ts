import { Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  CoreValidators,
  McsViewModelBase
} from '@app/core';

export class ConsoleSheetViewModel extends McsViewModelBase {
  public fcServer: FormControl;

  constructor(injector: Injector) {
    super(injector);

    this.fcServer = new FormControl('', [
      CoreValidators.required
    ]);

    this.registerControls({
      fcServer: this.fcServer
    });
  }
}
