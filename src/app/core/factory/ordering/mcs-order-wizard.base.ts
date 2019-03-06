import { ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import {
  PricingCalculator,
  IWizardStep
} from '@app/shared';
import {
  McsDisposable,
  isNullOrEmpty
} from '@app/utilities';
import { McsOrder } from '@app/models';
import { McsOrderBase } from './mcs-order.base';
import { McsWizardBase } from '../../base/mcs-wizard.base';

export abstract class McsOrderWizardBase extends McsWizardBase implements McsDisposable {
  public order$: Observable<McsOrder>;

  @ViewChild('pricingCalculator')
  public pricingCalculator: PricingCalculator;

  constructor(private _orderBase: McsOrderBase) {
    super(_orderBase);
    this._subscribeToOrderChanges();
  }

  /**
   * Event that emits when the wizard step has been changed
   * @param activeStep Next wizard step
   */
  public onWizardStepChanged(activeStep: IWizardStep): void {
    super.onWizardStepChanged(activeStep);

    let noPricingCalculator = isNullOrEmpty(this.pricingCalculator);
    if (noPricingCalculator) { return; }

    let displayWidget = activeStep.id.includes('confirm-step') || activeStep.isLastStep;
    displayWidget ?
      this.pricingCalculator.hideWidget() :
      this.pricingCalculator.showWidget();
  }

  /**
   * Disposes all the resources of the wizard base
   */
  public dispose(): void {
    super.dispose();
  }

  /**
   * Subscribe to order changes
   */
  private _subscribeToOrderChanges(): void {
    this.order$ = this._orderBase.orderChange().pipe(
      shareReplay(1)
    );
  }
}
