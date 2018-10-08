import {
  Directive,
  Input,
  forwardRef,
  Inject
} from '@angular/core';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  finalize
} from 'rxjs/operators';
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
    if (isNullOrEmpty(this.when)) {
      this._wizard.next();
      return;
    }

    // Set disable to the wizard while it is processing
    // the observable, when an error occured during the process,
    // the dialog box for error will be displayed and the wizard current step will remain
    this._wizard.disableWizard();
    this.when().pipe(
      catchError((_error) => {
        this._wizard.showErrorDialog();
        return throwError(_error);
      }),
      finalize(() => this._wizard.enableWizard())
    ).subscribe((response) => {
      if (isNullOrEmpty(response)) { return; }
      this._wizard.enableWizard();
      this._wizard.next();
    });
  }
}
