import {
  Directive,
  Input,
  forwardRef,
  Inject
} from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  isNullOrEmpty,
  McsDelegate
} from '@app/utilities';
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
  public when: McsDelegate<Observable<any>>;

  constructor(
    @Inject(forwardRef(() => WizardComponent)) private _wizard: WizardComponent
  ) { }

  /**
   * Proceed to next step if when is not provided,
   * otherwise it will wait after the when is finished before proceeding
   */
  public next(): void {
    if (isNullOrEmpty(this.when)) {
      this._wizard.next();
      return;
    }

    // Set disable to the wizard while it is processing
    // the observable, when an error occured during the process,
    // the dialog box for error will be displayed and the wizard current step will remain
    this._wizard.disableWizard();
    this.when().pipe(
      finalize(() => this._wizard.enableWizard())
    ).subscribe((response) => {
      if (isNullOrEmpty(response)) { return; }
      this._wizard.enableWizard();
      this._wizard.next();
    });
  }
}
