import {
  of,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  concatMap,
  filter,
  finalize,
  map,
  shareReplay,
  switchMap,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  McsAuthenticationIdentity,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  deliveryTypeText,
  DeliveryType,
  ItemType,
  McsCompany,
  McsFilterInfo,
  McsOrder,
  McsOrderApprover,
  McsOrderItem,
  McsOrderWorkflow,
  OrderWorkflowAction,
  RouteKey,
  WorkflowStatus,
  OrderIdType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DialogConfirmation,
  DialogRef,
  DialogService
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  CommonDefinition,
  convertMbToGb
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { LineProperties } from './order-line-properties';

enum OrderDetailsView {
  OrderDetails = 0,
  OrderApproval = 1
}

interface ChargesState {
  monthly: boolean;
  hourly: boolean;
  oneOff: boolean;
  excessUsagePerGb: boolean;
}

@Component({
  selector: 'mcs-order',
  templateUrl: './order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrderComponent implements OnInit, OnDestroy {
  public readonly filterPredicate: (filter) => boolean;
  public readonly dataSource: McsTableDataSource2<McsOrderItem>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  // Order items table
  public order$: Observable<McsOrder>;
  public isOrderTypeChange$: Observable<boolean>;
  public orderItemsColumns: string[];
  public orderDetailsView: OrderDetailsView;
  public dialogRef: DialogRef<TemplateRef<any>>;
  public chargesState$: Observable<ChargesState>;
  public isInAwaitingApprovalState: boolean;
  public isContractTermApplicable$: Observable<boolean>;
  private _lineOrderProperties: string;
  public orderProperties = new LineProperties(this._translate);

  @ViewChild('submitDialogTemplate')
  private _submitDialogTemplate: TemplateRef<any>;

  private _orderItemsChange = new BehaviorSubject<McsOrderItem[]>(null);
  private _orderItemsColumnPredicateMap = new Map<string, () => boolean>();

  private _orderApprovers: McsOrderApprover[];
  private _destroySubject = new Subject<void>();
  private _orderDataChangeHandler: Subscription;
  private _chargesStateChange = new BehaviorSubject<ChargesState>(
    { excessUsagePerGb: false, monthly: false, oneOff: false, hourly: false }
  );

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _dialogService: DialogService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity
  ) {
    this.filterPredicate = this._isColumnIncluded.bind(this);
    this.dataSource = new McsTableDataSource2(this._getOrderItems.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'costCentre' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'billingSite' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'monthlyCharge' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'hourlyCharge' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'oneOffCharge' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'excessFeePerGB' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'schedule' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'deliveryType' })
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters, this.filterPredicate);

    this._updateOnCompanySwitch();
    this.orderDetailsView = OrderDetailsView.OrderDetails;
  }

  public ngOnInit() {
    this._subscribeToOrderResolver();
    this._subscribeToParamChange();
    this._subscribeToChargesStateChange();
    this._subscribeToContractTermApplicableStatus();
    this._registerOrderDataChangeEvent();
    this._registerOrderItemsColumnMap();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._orderDataChangeHandler);
  }

  public get orderDetailsViewEnum() {
    return OrderDetailsView;
  }

  public get submitIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHECK;
  }

  public get cancelIconKey(): string {
    return CommonDefinition.ASSETS_SVG_BLOCK;
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get infoIconKey(): string {
    return CommonDefinition.ASSETS_SVG_INFO;
  }

  public get hasSchedule(): boolean {
    return !!this.dataSource?.findRecord(
      orderItem => !isNullOrEmpty(orderItem.schedule));
  }

  public get hasDeliveryTypeOptions(): boolean {
    return !!this.dataSource?.findRecord(
      orderItem => !isNullOrEmpty(orderItem.deliveryType));
  }

  public get isImpersonating(): boolean {
    return this._authenticationIdentity.isImpersonating;
  }

  public get lineOrderProperties(): string {
    return this._lineOrderProperties;
  }

  public getOrderProperties(row: McsOrderItem): void {
    this._lineOrderProperties = this.orderProperties.setLineProperties(row);
  }
  /**
   * Returns true when there are selected approvers
   */
  public get hasSelectedApprovers(): boolean {
    return !isNullOrEmpty(this._orderApprovers);
  }

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  /**
   * Returns delivery type field value
   */
  public getDeliveryType(deliveryType?: DeliveryType): string {
    return isNullOrEmpty(deliveryType) ? 'N/A' : deliveryTypeText[deliveryType];
  }

  /**
   * Returns the true if the duration is 0, false otherwise
   * @param duration contract term duration in months
   */
  public isContractDurationZero(duration: number): boolean {
    return duration === 0;
  }

  /**
   * Returns the equivalent order item types based on itemTypeId
   * @param typeId Type id to be searched
   */
  public getOderTypeById(typeId: string): string {
    return typeId;
  }

  /**
   * Whether to show annotation or not
   * @param companyId createdByCompanyId/modifiedByCompanyId of the selected order
   */
  public createdWithDifferentCompany(companyId: string): boolean {
    return companyId && this.activeCompany?.id !== companyId;
  }

  private _updateOnCompanySwitch(): void {
    this._eventDispatcher.addEventListener(McsEvent.accountChange, () => {
      this._changeDetectorRef.markForCheck()
    });
  }

  /**
   * Shows the approver selection table
   */
  public selectApprover(): void {
    this.orderDetailsView = OrderDetailsView.OrderApproval;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Cancels the approver selection
   */
  public cancelApproverSelection(): void {
    this.orderDetailsView = OrderDetailsView.OrderDetails;
    this._orderApprovers = [];
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the approvers has been selected
   * @param approvers Selected approvers
   */
  public onChangeApprover(approvers: McsOrderApprover[]): void {
    this._orderApprovers = approvers;
  }

  /**
   * Submits the current order for approval
   * @param order Order to be submitted
   */
  public submitForApproval(order: McsOrder): void {
    if (isNullOrEmpty(this._orderApprovers)) { return; }

    let dialogData = {
      data: order,
      title: this._translate.instant('order.submitForApproval'),
      message: this._translate.instant('order.submitForApprovalMessage',
        { order: order.description }),
      type: 'info'
    } as DialogConfirmation<McsOrder>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._apiService.createOrderWorkFlow(
          order.id,
          createObject(McsOrderWorkflow, {
            state: OrderWorkflowAction.AwaitingApproval,
            approvers: this._orderApprovers.map((approver) => approver.userId)
          })
        ).pipe(
          switchMap(() => this._apiService.getOrder(order.id)),
          finalize(() => this.orderDetailsView = OrderDetailsView.OrderDetails)
        );
      })
    ).subscribe();
  }

  /**
   * Cancels the current order
   * @param order Order to be cancelled
   */
  public cancelOrder(order: McsOrder): void {
    let dialogData = {
      data: order,
      title: this._translate.instant('order.cancelOrder'),
      message: this._translate.instant('order.cancelOrderMessage', { order: order.description }),
      type: 'error'
    } as DialogConfirmation<McsOrder>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._apiService.createOrderWorkFlow(
          order.id,
          createObject(McsOrderWorkflow, {
            state: OrderWorkflowAction.Cancelled
          })
        ).pipe(
          switchMap(() => this._apiService.getOrder(order.id))
        );
      })
    ).subscribe();
  }

  /**
   * Reject the current order
   * @param order Order to be rejected
   */
  public rejectOrder(order: McsOrder): void {
    let dialogData = {
      data: order,
      title: this._translate.instant('order.rejectOrder'),
      message: this._translate.instant('order.rejectOrderMessage', { order: order.description }),
      type: 'error'
    } as DialogConfirmation<McsOrder>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._apiService.createOrderWorkFlow(
          order.id, createObject(McsOrderWorkflow, {
            state: OrderWorkflowAction.Rejected
          })
        ).pipe(
          switchMap(() => this._apiService.getOrder(order.id))
        );
      })
    ).subscribe();
  }

  /**
   * Submit the current order
   * @param order Order to be submitted
   */
  public submitOrder(order: McsOrder): void {
    this.dialogRef = this._dialogService.open(this._submitDialogTemplate, {
      size: 'medium'
    });

    this.dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._apiService.createOrderWorkFlow(
          order.id,
          createObject(McsOrderWorkflow, {
            state: OrderWorkflowAction.Submitted,
            clientReferenceObject: {
              resourceDescription: order.progressDescription
            }
          })
        ).pipe(
          tap((approvedOrder) => this._navigationService.navigateTo(
            RouteKey.Notification,
            [getSafeProperty(approvedOrder, (obj) => obj.jobs[0].id)])
          )
        );
      })
    ).subscribe();
  }

  /**
   * Confirm and close the submit order dialog box
   * @param order Order to be submitted
   */
  public confirmSubmitOrderDialog(order: McsOrder): void {
    this.dialogRef.close(order);
  }

  /**
   * Close the submit order dialog box
   */
  public closeSubmitOrderDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Listens to parameter change
   */
  private _subscribeToParamChange(): void {
    this._activatedRoute.queryParams.pipe(
      take(1)
    ).subscribe((params: ParamMap) => {
      if (isNullOrEmpty(params)) { return; }

      let requestingApproval = params['approval-request'];
      if (requestingApproval) { this.selectApprover(); }
    });
  }

  /**
   * Returns the charges flags as observable
   */
  private _subscribeToChargesStateChange(): void {
    this.chargesState$ = this._chargesStateChange.asObservable().pipe(
      shareReplay(1)
    );
  }

  private _subscribeToOrderResolver(): void {
    this.order$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.order)),
      tap((order: McsOrder) => {
        this._setChargesState(order);
        this._orderItemsChange.next(order?.items || []);
        let workflowState = getSafeProperty(order, (obj) => obj.workflowState);
        this.isInAwaitingApprovalState = (workflowState === WorkflowStatus.AwaitingApproval);
      }),
      shareReplay(1)
    );

    this.isOrderTypeChange$ = this.order$.pipe(
      switchMap((order) => {
        let mainOrderItem = getSafeProperty(order, (obj) => obj.items[0]);
        if (isNullOrEmpty(mainOrderItem)) {
          throw new Error(this._translate.instant('order.errorOrderTypeNoOrderItems'));
        }
        return this._apiService.getOrderItemTypes({ keyword: mainOrderItem.itemOrderType }).pipe(
          map((orderTypeDetails) => {
            let orderDetail = getSafeProperty(orderTypeDetails, (obj) => obj.collection[0]);
            return !isNullOrEmpty(orderDetail) && orderDetail.itemType === ItemType.Change;
          }),
          shareReplay(1)
        );
      }),
      shareReplay(1)
    );
  }

  private _subscribeToContractTermApplicableStatus(): void {
    this.isContractTermApplicable$ = this.order$.pipe(
      switchMap((order) => {
        let mainOrderItem = getSafeProperty(order, (obj) => obj.items[0]);
        if (isNullOrEmpty(mainOrderItem)) {
          throw new Error(this._translate.instant('order.errorOrderTypeNoOrderItems'));
        }
        return this._apiService.getOrderItemTypes({ keyword: mainOrderItem.itemOrderType }).pipe(
          map((orderTypeDetails) => {
            let orderCollection = getSafeProperty(orderTypeDetails, (obj) => obj.collection);
            let orderHasContractTermApplicable = orderCollection.find((detail) => detail.contractTermApplicable);
            return !isNullOrEmpty(orderCollection) && !isNullOrEmpty(orderHasContractTermApplicable);
          }),
          shareReplay(1)
        );
      }),
      shareReplay(1)
    );
  }

  private _getOrderItems(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsOrderItem>> {
    return this._orderItemsChange.pipe(
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => new McsMatTableContext(response, response?.length))
    );
  }

  private _setChargesState(order: McsOrder): void {
    let chargesState: ChargesState = { oneOff: false, monthly: false, excessUsagePerGb: false, hourly: false };
    let orderItems = getSafeProperty(order, (obj) => obj.items, []);

    orderItems.forEach((orderItem) => {
      if (chargesState.excessUsagePerGb && chargesState.monthly && chargesState.oneOff) { return; }

      let excessUsageFee = getSafeProperty(orderItem, (obj) => obj.charges.excessUsageFeePerGB);
      chargesState.excessUsagePerGb = chargesState.excessUsagePerGb ? chargesState.excessUsagePerGb : !isNullOrUndefined(excessUsageFee);

      let monthly = getSafeProperty(orderItem, (obj) => obj.charges.monthly);
      chargesState.monthly = chargesState.monthly ? chargesState.monthly : !isNullOrUndefined(monthly);

      let oneOff = getSafeProperty(orderItem, (obj) => obj.charges.oneOff);
      chargesState.oneOff = chargesState.oneOff ? chargesState.oneOff : !isNullOrUndefined(oneOff);

      let hourly = getSafeProperty(orderItem, (obj) => obj.charges.hourly);
      chargesState.hourly = chargesState.hourly ? chargesState.hourly : !isNullOrUndefined(hourly);
    });
    this._chargesStateChange.next(chargesState);
  }

  private _registerOrderDataChangeEvent(): void {
    this._orderDataChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.dataChangeOrders, () => this._changeDetectorRef.markForCheck());
  }

  private _isColumnIncluded(filterInfo: McsFilterInfo): boolean {
    let filterFound = this._orderItemsColumnPredicateMap.get(filterInfo.id);
    return filterFound ? filterFound() : true;
  }

  private _registerOrderItemsColumnMap(): void {
    this._orderItemsColumnPredicateMap.set('hourlyCharge',
      () => this._chargesStateChange.getValue()?.hourly
    );

    this._orderItemsColumnPredicateMap.set('excessFeePerGB',
      () => this._chargesStateChange.getValue()?.excessUsagePerGb
    );

    this._orderItemsColumnPredicateMap.set('schedule',
      () => this.hasSchedule
    );

    this._orderItemsColumnPredicateMap.set('deliveryType',
      () => this.hasDeliveryTypeOptions
    );
  }
}
