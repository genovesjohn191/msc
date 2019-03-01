import {
  Directive,
  Input,
  forwardRef,
  Inject
} from '@angular/core';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from '@app/utilities';
import { WizardComponent } from '../wizard.component';

@Directive({
  selector: 'button[mcsWizardStepNext], a[mcsWizardStepNext]',
  host: {
    'class': 'wizard-step-next-button-wrapper',
    '[type]': 'type',
    '(click)': 'next()'
  }
})

export class WizardStepNextDirective {
  @Input('mcsWizardStepNextWhen')
  public when: Observable<boolean> | boolean;

  constructor(
    @Inject(forwardRef(() => WizardComponent)) private _wizard: WizardComponent
  ) { }

  /**
   * Proceed to next step if when is not provided,
   * otherwise it will wait after the when is finished before proceeding
   */
  public next(): void {
    if (isNullOrUndefined(this.when)) {
      this._wizard.next();
      return;
    }

    if (this.when instanceof Observable) {
      this.when.subscribe((result) => {
        if (!result) { return; }
        this._wizard.next();
      });
    } else if (this.when === true) {
      this._wizard.next();
    }
  }
}
