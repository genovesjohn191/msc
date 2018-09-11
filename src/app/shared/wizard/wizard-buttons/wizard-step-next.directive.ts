import {
  Directive,
  Input,
  forwardRef,
  Inject
} from '@angular/core';
import {
  Observable
} from 'rxjs';
import { McsDelegate } from '../../../core';
import { isNullOrEmpty } from '../../../utilities';
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
  @Input()
  public type: any;

  @Input('mcsWizardStepNextWhen')
  public when: McsDelegate<Observable<any>>;

  constructor(@Inject(forwardRef(() => WizardComponent)) private _wizard) { }

  /**
   * Proceed to next step if when is not provided,
   * otherwise it will wait after the when is finished before proceeding
   */
  public next(): void {
    isNullOrEmpty(this.when) ?
      this._wizard.next() :
      this.when().subscribe(() => this._wizard.next());
  }
}
