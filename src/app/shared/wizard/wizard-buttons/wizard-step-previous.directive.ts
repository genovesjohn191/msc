import {
  Directive,
  Input,
  forwardRef,
  Inject
} from '@angular/core';
import { WizardComponent } from '../wizard.component';

@Directive({
  selector: 'button[mcsWizardStepPrevious], a[mcsWizardStepPrevious]',
  host: {
    'class': 'wizard-step-previous-button-wrapper',
    '[type]': 'type',
    '(click)': 'previous()'
  }
})

export class WizardStepPreviousDirective {
  @Input()
  public type: any;

  constructor(@Inject(forwardRef(() => WizardComponent)) private _wizard) { }

  /**
   * Proceed to next step
   */
  public previous(): void {
    this._wizard.previous();
  }
}
