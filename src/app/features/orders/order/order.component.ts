import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subscription,
  throwError,
  Subject,
  Observable
} from 'rxjs';
import {
  catchError,
  takeUntil,
  finalize
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsErrorHandlerService,
  CoreDefinition,
  CoreRoutes,
  McsLoadingService
} from '@app/core';
import { unsubscribeSubject } from '@app/utilities';
import {
  RouteKey,
  McsOrder
} from '@app/models';
import { OrdersRepository } from '@app/services';

@Component({
  selector: 'mcs-order',
  templateUrl: './order.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrderComponent implements OnInit, OnDestroy {
  public textContent: any;

  public order$: Observable<McsOrder>;
  public orderSubscription: Subscription;
  public orderItemsColumns: string[];
  private _destroySubject = new Subject<void>();

  public constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _loadingService: McsLoadingService,
    private _errorHandlerService: McsErrorHandlerService,
    private _ordersRepository: OrdersRepository
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.orders.order;
    this._listenToParamChange();
    this._getOrderItemsColumnDef();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
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
   * Navigate to order listing
   */
  public gotoOrders(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Orders)]);
  }

  /**
   * Listens to parameter change
   */
  private _listenToParamChange(): void {
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
    this._loadingService.showLoader(this.textContent.loading);
    this.order$ = this._ordersRepository.findRecordById(orderId).pipe(
      catchError((error) => {
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return throwError(error);
      }),
      finalize(() => this._loadingService.hideLoader())
    );
  }

  /**
   * Gets the order items column definitions from text content
   */
  private _getOrderItemsColumnDef(): void {
    this.orderItemsColumns = Object.keys(this.textContent.columnHeaders);
    this._changeDetectorRef.markForCheck();
  }
}
