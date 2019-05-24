import {
  ViewChild,
  Injector
} from '@angular/core';
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
  RouteKey,
  McsOrderItemType
} from '@app/models';
import { McsOrderBase } from './mcs-order.base';
import { McsWizardBase } from '../../base/mcs-wizard.base';
import { McsNavigationService } from '../../services/mcs-navigation.service';
import { McsAccessControlService } from '../../authentication/mcs-access-control.service';

export abstract class McsOrderWizardBase extends McsWizardBase implements McsDisposable {
  public order$: Observable<McsOrder>;
  public orderItemType$: Observable<McsOrderItemType>;

  @ViewChild('pricingCalculator')
  public pricingCalculator: PricingCalculator;

  private _pricingIsHiddenByStep: boolean;
  private readonly _accessControlService: McsAccessControlService;
  private readonly _navigationService: McsNavigationService;

  constructor(
    private _injector: Injector,
    private _orderBase: McsOrderBase
  ) {
    super(_orderBase);
    this._accessControlService = this._injector.get(McsAccessControlService);
    this._navigationService = this._injector.get(McsNavigationService);
    this._subscribeToOrderChanges();
    this._subscribeToOrderItemTypeChanges();
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

    // We need to send the order as a draft when the request is awaiting approval
    // and navigate to order details page with approvers as initial display
    let subjectForApproval = workflow.state === OrderWorkflowAction.AwaitingApproval;
    if (subjectForApproval) { workflow.state = OrderWorkflowAction.Draft; }

    this._orderBase.submitOrderWorkflow(workflow).pipe(
      tap(() => this.navigateOrderByWorkflowAction(subjectForApproval ?
        OrderWorkflowAction.AwaitingApproval : workflow.state))
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

    workflowAction === OrderWorkflowAction.AwaitingApproval ?
      this._navigationService.navigateTo(RouteKey.OrderDetails, [this._orderBase.order.id], {
        queryParams: { 'approval-request': true }
      }) :
      this._navigationService.navigateTo(RouteKey.OrderDetails, [this._orderBase.order.id]);
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
   * Subscribes to order item type changes
   */
  private _subscribeToOrderItemTypeChanges(): void {
    if (!this._accessControlService.hasAccessToFeature('EnableOrdering')) { return; }
    this.orderItemType$ = this._orderBase.orderItemTypeChange().pipe(
      shareReplay(1)
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
