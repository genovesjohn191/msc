import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  throwError,
  Subject,
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  takeUntil,
  finalize,
  shareReplay,
  concatMap,
  tap
} from 'rxjs/operators';
import {
  McsErrorHandlerService,
  CoreDefinition,
  McsTableDataSource,
  McsDialogService,
  McsNavigationService
} from '@app/core';
import {
  unsubscribeSubject,
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  McsOrder,
  McsOrderItem,
  OrderWorkflowAction,
  McsOrderApprover,
  RouteKey
} from '@app/models';
import { McsOrdersRepository } from '@app/services';
import {
  DialogConfirmationComponent,
  DialogConfirmation
} from '@app/shared';

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

  private _orderApprovers: McsOrderApprover[];
  private _destroySubject = new Subject<void>();

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
    private _dialogService: McsDialogService,
    private _errorHandlerService: McsErrorHandlerService,
    private _navigationService: McsNavigationService,
    private _ordersRepository: McsOrdersRepository
  ) {
    this.orderDetailsView = OrderDetailsView.OrderDetails;
    this.orderItemsDataSource = new McsTableDataSource();
    this.setOrderItemsColumn();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToDataChange();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
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

    let dialogRef = this._dialogService.open(DialogConfirmationComponent, {
      data: dialogData,
      size: 'medium'
    });

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._ordersRepository.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.AwaitingApproval,
          approvers: this._orderApprovers.map((approver) => approver.userId)
        }).pipe(
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

    let dialogRef = this._dialogService.open(DialogConfirmationComponent, {
      data: dialogData,
      size: 'medium'
    });

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._ordersRepository.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.Cancelled
        });
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

    let dialogRef = this._dialogService.open(DialogConfirmationComponent, {
      data: dialogData,
      size: 'medium'
    });

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._ordersRepository.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.Rejected
        });
      })
    ).subscribe();
  }

  /**
   * Submit the current order
   * @param order Order to be cancelled
   */
  public submitOrder(order: McsOrder): void {
    let dialogData = {
      data: order,
      title: this._translate.instant('order.submitOrder'),
      message: this._translate.instant('order.submitOrderMessage', { order: order.description }),
      type: 'info'
    } as DialogConfirmation<McsOrder>;

    let dialogRef = this._dialogService.open(DialogConfirmationComponent, {
      data: dialogData,
      size: 'medium'
    });

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return this._ordersRepository.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.Submitted
        }).pipe(
          tap((approvedOrder) => this._navigationService.navigateTo(RouteKey.Notification,
            getSafeProperty(approvedOrder, (obj) => obj.jobs[0].id))
          )
        );
      })
    ).subscribe();
  }

  /**
   * Listens to parameter change
   */
  private _subscribeToParamChange(): void {
    this._activatedRoute.paramMap
      .pipe(takeUntil(this._destroySubject))
      .subscribe((params: ParamMap) => {
        let orderId = params.get('id');
        this._subscribeToOrderById(orderId);
      });
  }

  /**
   * Get Order based on the given ID in the provided parameter
   */
  private _subscribeToOrderById(orderId: string): void {
    this.order$ = this._ordersRepository.getByIdAsync(orderId).pipe(
      catchError((error) => {
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      }),
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
   * Subscribes to orders data changes
   */
  private _subscribeToDataChange(): void {
    this._ordersRepository.dataChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
