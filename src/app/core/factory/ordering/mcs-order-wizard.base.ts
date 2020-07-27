import {
  ViewChild,
  Injector
} from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  throwError
} from 'rxjs';
import {
  shareReplay,
  tap,
  startWith,
  distinctUntilChanged,
  catchError
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  PricingCalculator,
  IWizardStep
} from '@app/shared';
import {
  McsDisposable,
  isNullOrEmpty,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import {
  McsOrder,
  OrderWorkflowAction,
  McsOrderWorkflow,
  RouteKey,
  McsOrderItemType,
  McsFeatureFlag,
  McsEventTrack,
  OrderWorkflowSubmitStatus
} from '@app/models';
import { McsOrderBase } from './mcs-order.base';
import { McsWizardBase } from '../../base/mcs-wizard.base';
import { McsNavigationService } from '../../services/mcs-navigation.service';
import { McsAccessControlService } from '../../authentication/mcs-access-control.service';
interface OrderEventTrack {
  orderDetailsStep?: McsEventTrack;
  billingDetailsStep: McsEventTrack;
}

export abstract class McsOrderWizardBase extends McsWizardBase implements McsDisposable {
  public order$: Observable<McsOrder>;
  public orderItemType$: Observable<McsOrderItemType>;
  public orderWorkflowSubmitStatus$: Observable<OrderWorkflowSubmitStatus>;

  @ViewChild('pricingCalculator', { static: false })
  public pricingCalculator: PricingCalculator;

  protected readonly translateService: TranslateService;
  protected readonly accessControlService: McsAccessControlService;

  private _pricingIsHiddenByStep: boolean;
  private _orderWorkflowSubmitStatusChange: BehaviorSubject<OrderWorkflowSubmitStatus>;
  private _currentWorkflowState: OrderWorkflowAction = OrderWorkflowAction.Unknown;
  private readonly _navigationService: McsNavigationService;

  constructor(
    private _orderBase: McsOrderBase,
    protected _injector: Injector,
    public orderEventTrack: OrderEventTrack
  ) {
    super(_orderBase);
    this.accessControlService = this._injector.get(McsAccessControlService);
    this._navigationService = this._injector.get(McsNavigationService);
    this.translateService = this._injector.get(TranslateService);
    this._orderWorkflowSubmitStatusChange = new BehaviorSubject(OrderWorkflowSubmitStatus.NeverAttempted);
    this._setDefaultEventTrackingDetails();
    this._subscribeToOrderChanges();
    this._subscribeToOrderItemTypeChanges();
    this._subscribeToOrderWorkflowSubmitStatusChange();
  }

  /**
   * Returns the progress description label with order number for the current order
   */
  public get progressDescription(): string {
    return getSafeProperty(this._orderBase.order, (obj) => obj.progressDescription);
  }

  /**
   * Returns true if the order is to be submitted
   */
  public get orderIsToBeSubmitted(): boolean {
    return this._currentWorkflowState === OrderWorkflowAction.Submitted;
  }

  /**
   * Returns true if the order is draft or awaiting for approval
   */
  public get orderIsDraft(): boolean {
    return this._currentWorkflowState === OrderWorkflowAction.AwaitingApproval || this._currentWorkflowState === OrderWorkflowAction.Draft;
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
    this._currentWorkflowState = workflow.state;
    let subjectForApproval = workflow.state === OrderWorkflowAction.AwaitingApproval;
    if (subjectForApproval) { workflow.state = OrderWorkflowAction.Draft; }

    this._setWorkflowSubmitStatus(OrderWorkflowSubmitStatus.SavingAsDraft, OrderWorkflowSubmitStatus.InProgressSubmit);
    this._orderBase.submitOrderWorkflow(workflow).pipe(
      tap(() => {
        this._currentWorkflowState = subjectForApproval ? OrderWorkflowAction.AwaitingApproval : workflow.state;
        this._setWorkflowSubmitStatus(OrderWorkflowSubmitStatus.SavedAsDraft, OrderWorkflowSubmitStatus.SuccessfulSubmit);
        this.navigateOrderByWorkflowAction(this._currentWorkflowState);
      }),
      catchError((error) => {
        this._setWorkflowSubmitStatus(OrderWorkflowSubmitStatus.FailedDraft, OrderWorkflowSubmitStatus.FailedSubmit);
        return throwError(error);
      })
    ).subscribe();
  }

  /**
   * Navigates the order based on the workflow action triggered
   * @param workflowAction Workflow action to be navigated
   */
  public navigateOrderByWorkflowAction(workflowAction: OrderWorkflowAction): void {
    if (!this.orderIsDraft) { return; }
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
    if (!this.accessControlService.hasAccessToFeature(McsFeatureFlag.Ordering)) { return; }
    this.orderItemType$ = this._orderBase.orderItemTypeChange().pipe(
      shareReplay(1)
    );
  }

  /**
   * Subscribes to order item type changes
   */
  private _subscribeToOrderWorkflowSubmitStatusChange(): void {
    this.orderWorkflowSubmitStatus$ = this._orderWorkflowSubmitStatusChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Sets the pricing calculator visibility
   */
  private _setPricingCalculatorVisibility(): void {
    let noPricingCalculator = isNullOrEmpty(this.pricingCalculator);
    if (noPricingCalculator) { return; }

    if (this._pricingIsHiddenByStep || !CommonDefinition.ORDERING_ENABLE_PRICING_CALCULATOR) {
      this.pricingCalculator.hideWidget();
      return;
    }

    let hasOrder = !isNullOrEmpty(this._orderBase.order);
    hasOrder ?
      this.pricingCalculator.showWidget() :
      this.pricingCalculator.hideWidget();
  }

  /**
   * Sets the workflow submit status based on submit type, final and draft
   */
  private _setWorkflowSubmitStatus(draftStatusToSet: OrderWorkflowSubmitStatus, submitStatusToSet: OrderWorkflowSubmitStatus): void {
    let status = this.orderIsDraft ? draftStatusToSet : submitStatusToSet;
    this._orderWorkflowSubmitStatusChange.next(status);
  }

  /**
   * Sets the default event tracking details for an order
   */
  private _setDefaultEventTrackingDetails(): void {
    if (!isNullOrEmpty(this.orderEventTrack) && Object.keys(this.orderEventTrack).length !== 0) {
      return;
    }
    this.orderEventTrack = {
      orderDetailsStep: {
        category: 'order',
        label: 'order-details-step',
        action: 'next-button'
      },
      billingDetailsStep: {
        category: 'order',
        label: 'billing-details-step',
        action: 'next-button'
      },
    };
  }
}
