import {
  Directive,
  forwardRef,
  Inject
} from '@angular/core';
import { WizardComponent } from '../wizard.component';

@Directive({
  selector: 'button[mcsWizardStepPrevious], a[mcsWizardStepPrevious]',
  host: {
    'class': 'wizard-step-previous-button-wrapper',
    '(click)': 'previous()'
  }
})

export class WizardStepPreviousDirective {
  constructor(@Inject(forwardRef(() => WizardComponent)) private _wizard) { }

  /**
   * Proceed to next step
   */
  public previous(): void {
    this._wizard.previous();
  }
}
