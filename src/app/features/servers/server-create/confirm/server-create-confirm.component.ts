import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import {
  throwError,
  Observable
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsDataStatusFactory
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsOrder,
  McsOrderItemType
} from '@app/models';
import { OrderItemTypesRepository } from '@app/services';
import { ServerOrderDetail } from './server-order-detail';
import { ServerCreateFlyweightContext } from '../server-create-flyweight.context';

@Component({
  selector: 'mcs-server-create-confirm',
  templateUrl: 'server-create-confirm.component.html'
})

export class ServerCreateConfirmComponent implements OnInit {
  public textContent: any;
  public order$: Observable<McsOrder>;
  public createOrderWorkflow = this._createOrderWorkflow.bind(this);

  @Input()
  public order: McsOrder;

  // Model binding (should be enum type)
  public selectedTerm: number = 0;
  public selectedEntity: number = 0;
  public selectedSite: number = 0;
  public selectedCost: number = 0;
  public selectedAction: number = 0;
  public selectedServer: number = 0;

  public itemTypesStatusFactory: McsDataStatusFactory<McsOrderItemType[]>;
  public orderDataSource: ServerOrderDetail[];
  public dataColumns: string[] = [];

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderItemTypesRepository: OrderItemTypesRepository,
    private _serverCreateFlyweightContext: ServerCreateFlyweightContext
  ) {
    this.orderDataSource = new Array();
    this.itemTypesStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer.serverConfirmStep;
    this._getItemTypes();
    this._subscribeToOrderChanges();
    this._setDataColumns();
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
        this.itemTypesStatusFactory.setSuccessful(response);
      });
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.dataColumns = Object.keys(this.textContent.orderDetails.columnHeaders);
    if (isNullOrEmpty(this.dataColumns)) {
      throw new Error('column definition for order charges was not defined');
    }
  }

  /**
   * Subscribes to order changes
   */
  private _subscribeToOrderChanges(): void {
    this.order$ = this._serverCreateFlyweightContext.orderChanges;
  }

  /**
   * Creates the order workflow based on the order contents
   */
  private _createOrderWorkflow(): Observable<McsOrder> {
    return this._serverCreateFlyweightContext.createOrderWorkflow();
  }
}
