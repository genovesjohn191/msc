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
  concatMap
} from 'rxjs/operators';
import {
  McsErrorHandlerService,
  CoreDefinition,
  McsLoadingService,
  McsTableDataSource,
  McsDialogService
} from '@app/core';
import {
  unsubscribeSubject,
  isNullOrEmpty
} from '@app/utilities';
import {
  McsOrder,
  McsOrderItem,
  OrderWorkflowAction
} from '@app/models';
import { McsOrdersRepository } from '@app/services';
import {
  DialogConfirmationComponent,
  DialogConfirmation
} from '@app/shared';

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

  private _destroySubject = new Subject<void>();

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translate: TranslateService,
    private _dialogService: McsDialogService,
    private _loadingService: McsLoadingService,
    private _errorHandlerService: McsErrorHandlerService,
    private _ordersRepository: McsOrdersRepository
  ) {
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
   * Submits the current order for approval
   * @param order Order to be submitted
   */
  public submitForApproval(order: McsOrder): void {
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

        this._loadingService.showLoader(this._translate.instant('order.submitOrderLoading'));
        return this._ordersRepository.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.AwaitingApproval
        });
      }),
      finalize(() => this._loadingService.hideLoader())
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

        this._loadingService.showLoader(this._translate.instant('order.cancelOrderLoading'));
        return this._ordersRepository.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.Cancelled
        });
      }),
      finalize(() => this._loadingService.hideLoader())
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

        this._loadingService.showLoader(this._translate.instant('order.rejectOrderLoading'));
        return this._ordersRepository.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.Rejected
        });
      }),
      finalize(() => this._loadingService.hideLoader())
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

        this._loadingService.showLoader(this._translate.instant('order.submitOrderLoading'));
        return this._ordersRepository.createOrderWorkFlow(order.id, {
          state: OrderWorkflowAction.Submitted
        });
      }),
      finalize(() => this._loadingService.hideLoader())
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
    this._loadingService.showLoader(this._translate.instant('order.loading'));
    this.order$ = this._ordersRepository.getById(orderId).pipe(
      catchError((error) => {
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      }),
      shareReplay(1),
      finalize(() => this._loadingService.hideLoader())
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
