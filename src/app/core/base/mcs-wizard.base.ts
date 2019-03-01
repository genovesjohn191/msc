import { ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  FormMessage,
  IWizardStep
} from '@app/shared';
import {
  isNullOrUndefined,
  isNullOrEmpty,
  McsDisposable,
  unsubscribeSafely
} from '@app/utilities';
import { DataStatus } from '@app/models';
import { IMcsErrorable } from '../interfaces/mcs-errorable.interface';
import { IMcsStateChangeable } from '../interfaces/mcs-state-changeable.interface';

export abstract class McsWizardBase implements McsDisposable {
  @ViewChild('formMessage')
  public formMessage: FormMessage;

  private _wizardDestroySubject = new Subject<void>();

  constructor(
    private _errorableContext: IMcsErrorable,
    private _stateChangeContext: IMcsStateChangeable
  ) {
    this._subscribeToErrorResponse();
    this._subscribeToStateChange();
  }

  /**
   * Event that emits when the wizard step has been changed
   * @param activeStep Next wizard step
   */
  public onWizardStepChanged(activeStep: IWizardStep): void {
    let noActiveStep = isNullOrEmpty(activeStep);
    if (noActiveStep) { return; }

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
    this._errorableContext.errorsChange().pipe(
      takeUntil(this._wizardDestroySubject)
    ).subscribe(this._showWizardFormErrorMessage.bind(this));
  }

  /**
   * Subscribes to state changeable of the data context
   */
  private _subscribeToStateChange(): void {
    this._stateChangeContext.stateChange().pipe(
      takeUntil(this._wizardDestroySubject)
    ).subscribe((state) => {
      let isWizardProcessCompleted = state === DataStatus.InProgress ||
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
      fallbackMessage: 'Somethings went wrong while trying to process the request'
    });
  }
}
