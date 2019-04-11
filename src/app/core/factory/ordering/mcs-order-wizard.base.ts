import { ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import {
  shareReplay,
  tap,
  startWith
} from 'rxjs/operators';
import {
  PricingCalculator,
  IWizardStep
} from '@app/shared';
import {
  McsDisposable,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsOrder,
  OrderWorkflowAction,
  McsOrderWorkflow,
  RouteKey
} from '@app/models';
import { McsOrderBase } from './mcs-order.base';
import { McsWizardBase } from '../../base/mcs-wizard.base';
import { McsNavigationService } from '../../services/mcs-navigation.service';

export abstract class McsOrderWizardBase extends McsWizardBase implements McsDisposable {
  public order$: Observable<McsOrder>;

  @ViewChild('pricingCalculator')
  public pricingCalculator: PricingCalculator;
  private _pricingIsHiddenByStep: boolean;

  constructor(
    private _navigationService: McsNavigationService,
    private _orderBase: McsOrderBase
  ) {
    super(_orderBase);
    this._subscribeToOrderChanges();
  }

  /**
   * Event that emits when the wizard step has been changed
   * @param activeStep Next wizard step
   */
  public onWizardStepChanged(activeStep: IWizardStep): void {
    super.onWizardStepChanged(activeStep);

    this._pricingIsHiddenByStep = activeStep.id.includes('confirm-step')
      || activeStep.isLastStep;
    this._setPricingCalculatorVisibility();
  }

  /**
   * Subsmit the order workflow
   * @param workflow Workflow details to be submitted
   */
  public submitOrderWorkflow(workflow: McsOrderWorkflow): void {
    if (isNullOrEmpty(workflow)) { return; }

    this._orderBase.submitOrderWorkflow(workflow).pipe(
      tap(() => this.navigateOrderByWorkflowAction(workflow.state))
    ).subscribe();
  }

  /**
   * Navigates the order based on the workflow action triggered
   * @param workflowAction Workflow action to be navigated
   */
  public navigateOrderByWorkflowAction(workflowAction: OrderWorkflowAction): void {
    let shouldBeRedirected = workflowAction === OrderWorkflowAction.AwaitingApproval ||
      workflowAction === OrderWorkflowAction.Draft;
    if (!shouldBeRedirected) { return; }

    this._navigationService.navigateTo(RouteKey.OrderDetails, this._orderBase.order.id);
  }

  /**
   * Disposes all the resources of the wizard base
   */
  public dispose(): void {
    super.dispose();
    this._orderBase.dispose();
  }

  /**
   * Subscribe to order changes
   */
  private _subscribeToOrderChanges(): void {
    this.order$ = this._orderBase.orderChange().pipe(
      startWith(null),
      shareReplay(1),
      tap(() => this._setPricingCalculatorVisibility())
    );
  }

  /**
   * Sets the pricing calculator visibility
   */
  private _setPricingCalculatorVisibility(): void {
    let noPricingCalculator = isNullOrEmpty(this.pricingCalculator);
    if (noPricingCalculator) { return; }

    if (this._pricingIsHiddenByStep) {
      this.pricingCalculator.hideWidget();
      return;
    }

    let hasOrder = !isNullOrEmpty(this._orderBase.order);
    hasOrder ?
      this.pricingCalculator.showWidget() :
      this.pricingCalculator.hideWidget();
  }
}
