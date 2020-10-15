import {
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  Component,
  Inject,
  ViewChild
} from '@angular/core';
import {
  DataStatus,
  McsJob
} from '@app/models';
import {
  FormMessage,
  IWizardStep
} from '@app/shared';
import {
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';

import {
  IMcsWizard,
  MCSWIZARD_INJECTION
} from '../interfaces/mcs-wizard.interface';

@Component({ template: '' })
export abstract class McsWizardBase implements McsDisposable {
  public jobs$: Observable<McsJob[]>;
  public dataStatus$: Observable<DataStatus>;

  @ViewChild('formMessage', { static: false })
  public formMessage: FormMessage;

  private _activeStep: IWizardStep;
  private _wizardDestroySubject = new Subject<void>();

  constructor(@Inject(MCSWIZARD_INJECTION) private _wizardContext: IMcsWizard) {
    this._subscribeToErrorResponse();
    this._subscribeToStateChange();
    this._subscribeToDataStateChanges();
    this._subscribeToJobsChanges();
  }

  /**
   * Returns the active wizard step
   */
  public getActiveWizardStep(): IWizardStep {
    return this._activeStep || Object.create({});
  }

  /**
   * Event that emits when the wizard step has been changed
   * @param activeStep Next wizard step
   */
  public onWizardStepChanged(activeStep: IWizardStep): void {
    this._activeStep = activeStep;
    if (isNullOrEmpty(this._activeStep)) { return; }

    if (activeStep.isLastStep && !isNullOrEmpty(this.formMessage)) {
      this.formMessage.updateConfiguration({
        hideDismissButton: true
      });
    }
  }

  /**
   * Disposes all the resources of the wizard base
   */
  public dispose(): void {
    unsubscribeSafely(this._wizardDestroySubject);
  }

  /**
   * Subscribe to errorable response of the context
   */
  private _subscribeToErrorResponse(): void {
    this._wizardContext.errorsChange().pipe(
      takeUntil(this._wizardDestroySubject)
    ).subscribe(this._showWizardFormErrorMessage.bind(this));
  }

  /**
   * Subscribes to state changeable of the data context
   */
  private _subscribeToStateChange(): void {
    this._wizardContext.stateChange().pipe(
      takeUntil(this._wizardDestroySubject)
    ).subscribe((state) => {
      let isWizardProcessCompleted = state === DataStatus.Active ||
        state === DataStatus.Success;
      if (isWizardProcessCompleted) {
        this._hideWizardFormMessage();
      }
    });
  }

  /**
   * Hides the form message wizard
   */
  private _hideWizardFormMessage(): void {
    if (isNullOrUndefined(this.formMessage)) { return; }
    this.formMessage.hideMessage();
  }

  /**
   * Shows the wizard error form message that includes the corresponding error response
   * @param errorMessages Error messages to be displayed on the form
   */
  private _showWizardFormErrorMessage(errorMessages: string[]): void {
    if (isNullOrUndefined(this.formMessage)) { return; }
    this.formMessage.showMessage('error', {
      messages: errorMessages,
      fallbackMessage: 'Something went wrong while trying to process the request'
    });
  }

  /**
   * Subscribes to data state changes
   */
  private _subscribeToDataStateChanges(): void {
    this.dataStatus$ = this._wizardContext.stateChange().pipe(
      takeUntil(this._wizardDestroySubject),
      shareReplay(1)
    );
  }

  /**
   * Subscribes to jobs changes
   */
  private _subscribeToJobsChanges(): void {
    this.jobs$ = this._wizardContext.jobsChange().pipe(
      takeUntil(this._wizardDestroySubject),
      shareReplay(1)
    );
  }
}
