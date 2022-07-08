import { Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  CoreValidators,
  McsViewModelBase
} from '@app/core';
import { McsServer } from '@app/models';

export class ConsoleSheetViewModel extends McsViewModelBase {
  public fcServer: FormControl<McsServer>;

  constructor(injector: Injector) {
    super(injector);

    this.fcServer = new FormControl<McsServer>(null, [
      CoreValidators.required
    ]);

    this.registerControls({
      fcServer: this.fcServer
    });
  }
}
