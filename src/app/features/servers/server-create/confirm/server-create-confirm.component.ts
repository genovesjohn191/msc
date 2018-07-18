import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsDataStatusFactory
} from '../../../../core';
import {
  Order,
  OrderItemTypesRepository,
  OrderItemType
} from '../../../orders';
import { ServerOrderDetail } from './server-order-detail';
import { isNullOrEmpty } from '../../../../utilities';

@Component({
  selector: 'mcs-server-create-confirm',
  templateUrl: 'server-create-confirm.component.html'
})

export class ServerCreateConfirmComponent implements OnInit, OnDestroy {
  public textContent: any;

  @Input()
  public order: Order;

  // Model binding (should be enum type)
  public selectedTerm: number = 0;
  public selectedEntity: number = 0;
  public selectedSite: number = 0;
  public selectedCost: number = 0;
  public selectedAction: number = 0;
  public selectedServer: number = 0;

  public itemTypesStatusFactory: McsDataStatusFactory<OrderItemType[]>;
  public orderDataSource: ServerOrderDetail[];
  public dataColumns = ['charge', 'monthlyFee', 'oneOffCharge'];

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderItemTypesRepository: OrderItemTypesRepository
  ) {
    this.orderDataSource = new Array();
    this.itemTypesStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer.serverConfirmStep;
    this._getItemTypes();
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy() {
    // unsubscribeSafely(this.serversSubscription);
  }

  public updateOrder(): void {
    // Do the updating of order here
  }

  public submitOrder(): void {
    // Do the submitting of order right after updating the whole order
  }

  /**
   * Gets all the item types of the order
   */
  private _getItemTypes(): void {
    this.itemTypesStatusFactory.setInProgress();
    this._orderItemTypesRepository.findAllRecords()
      .pipe(
        catchError((error) => {
          this.itemTypesStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this._createOrdersTable(response);
        this.itemTypesStatusFactory.setSuccessful(response);
      });
  }

  /**
   * Creates the order table based on order data and item types
   * @param orderItemTypes Order item type from where to get the order item details
   */
  private _createOrdersTable(orderItemTypes: OrderItemType[]): void {
    let orderIsEmpty = isNullOrEmpty(orderItemTypes) || isNullOrEmpty(this.order);
    if (orderIsEmpty) { return; }

    // Add per-item details of order
    this.order.items.forEach((_item) => {
      let itemDetails = orderItemTypes.find((itemType) => {
        return itemType.id === _item.id;
      });
      if (isNullOrEmpty(itemDetails)) { return; }

      this.orderDataSource.push({
        header: itemDetails.name,
        charges: _item.charges
      } as ServerOrderDetail);
    });

    // Add the total details of order
    this.orderDataSource.push({
      header: 'Total',
      charges: this.order.charges
    } as ServerOrderDetail);
  }
}
