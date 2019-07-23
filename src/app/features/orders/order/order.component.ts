import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  Subject,
  Observable,
  of,
  Subscription
} from 'rxjs';
import {
  finalize,
  shareReplay,
  concatMap,
  tap,
  take,
  map,
  switchMap
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsTableDataSource,
  McsNavigationService
} from '@app/core';
import {
  unsubscribeSubject,
  isNullOrEmpty,
  getSafeProperty,
  unsubscribeSafely
} from '@app/utilities';
import {
  McsOrder,
  McsOrderItem,
  OrderWorkflowAction,
  McsOrderApprover,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DialogService,
  DialogConfirmation,
  DialogRef
} from '@app/shared';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';

enum OrderDetailsView {
  OrderDetails = 0,
  OrderApproval = 1
}

@Component({
  selector: 'mcs-order',
  templateUrl: './order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrderComponent implements OnInit, OnDestroy {
  // Order items table
  public order$: Observable<McsOrder>;
  public orderItemsColumns: string[];
  public orderItemsDataSource: McsTableDataSource<McsOrderItem>;
  public orderDetailsView: OrderDetailsView;
  public dialogRef: DialogRef<TemplateRef<any>>;

  @ViewChild('submitDialogTemplate')
  private _submitDialogTemplate: TemplateRef<any>;

  private _orderApprovers: McsOrderApprover[];
  private _destroySubject = new Subject<void>();
  private _orderDataChangeHandler: Subscription;

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _dialogService: DialogService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    this.orderDetailsView = OrderDetailsView.OrderDetails;
    this.orderItemsDataSource = new McsTableDataSource();
    this.setOrderItemsColumn();
  }

  public ngOnInit() {
    this._subscribeToOrderResolver();
    this._subscribeToParamChange();
    this._registerOrderDataChangeEvent();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
    unsubscribeSafely(this._orderDataChangeHandler);
  }

  public get orderDetailsViewEnum() {
    return OrderDetailsView;
  }

  public get submitIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHECK;
  }

  public get cancelIconKey(): string {
    return CoreDefinition.ASSETS_SVG_BLOCK;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get infoIconKey(): string {
    return CoreDefinition.ASSETS_SVG_INFO;
  }

  /**
   * Returns true when there are selected approvers
   */
  public get hasSelectedApprovers(): boolean {
    return !isNullOrEmpty(this._orderApprovers);
  }

  /**
   * Returns the equivalent order item types based on itemTypeId
   * @param typeId Type id to be searched
   */
  public getOderTypeById(typeId: string): string {
    // TODO: return the type description from API
    // once the endpoint for /order/items/type is done
    return typeId;
  }

  /**
   * Returns the order items data source
   * @param order Order on where to get the items that to be displayed on the table
   */
  public getOrderItemsDatasource(order: McsOrder): McsTableDataSource<McsOrderItem> {
    if (isNullOrEmpty(order)) { return undefined; }
    this.orderItemsDataSource.updateDatasource(order.items);
    return this.orderItemsDataSource;
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
        return this._apiService.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.AwaitingApproval,
          approvers: this._orderApprovers.map((approver) => approver.userId)
        }).pipe(
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
        return this._apiService.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.Cancelled
        }).pipe(
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
        return this._apiService.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.Rejected
        }).pipe(
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
        return this._apiService.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.Submitted,
          clientReferenceObject: {
            resourceDescription: order.progressDescription
          }
        }).pipe(
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
   * Subscribes to order resolver
   */
  private _subscribeToOrderResolver(): void {
    this.order$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.order)),
      shareReplay(1)
    );
  }

  /**
   * Gets the order items column definitions from text content
   */
  private setOrderItemsColumn(): void {
    this.orderItemsColumns = Object.keys(this._translate.instant('order.columnHeaders'));
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Registers the order data change event
   */
  private _registerOrderDataChangeEvent(): void {
    this._orderDataChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.dataChangeOrders, () => this._changeDetectorRef.markForCheck());
  }
}
