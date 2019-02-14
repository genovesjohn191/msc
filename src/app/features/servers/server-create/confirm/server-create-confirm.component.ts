import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import {
  throwError,
  Observable
} from 'rxjs';
import {
  catchError,
  tap
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsDataStatusFactory,
  CoreRoutes
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsOrder,
  McsOrderItemType,
  OrderWorkflowAction,
  RouteKey
} from '@app/models';
import { McsOrderItemTypesRepository } from '@app/services';
import { ServerOrderDetail } from './server-order-detail';
import { ServerCreateFlyweightContext } from '../server-create-flyweight.context';

@Component({
  selector: 'mcs-server-create-confirm',
  templateUrl: 'server-create-confirm.component.html'
})

export class ServerCreateConfirmComponent implements OnInit {
  public textContent: any;
  public order$: Observable<McsOrder>;
  public createOrderWorkflow: () => Observable<McsOrder>;

  @Input()
  public order: McsOrder;

  public itemTypesStatusFactory: McsDataStatusFactory<McsOrderItemType[]>;
  public orderDataSource: ServerOrderDetail[];
  public dataColumns: string[] = [];

  // Model binding (should be enum type)
  public selectedTerm: number = 0;
  public selectedEntity: number = 0;
  public selectedSite: number = 0;
  public selectedCost: number = 0;
  public selectedServer: number = 0;

  public get selectedAction(): OrderWorkflowAction { return this._selectedAction; }
  public set selectedAction(value: OrderWorkflowAction) {
    this._selectedAction = value;
    this.createOrderWorkflow = this._orderWorkFlowMap.get(this._selectedAction);
  }
  private _selectedAction: OrderWorkflowAction;
  private _orderWorkFlowMap: Map<OrderWorkflowAction, () => Observable<McsOrder>>;

  constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderItemTypesRepository: McsOrderItemTypesRepository,
    private _serverCreateFlyweightContext: ServerCreateFlyweightContext
  ) {
    this._orderWorkFlowMap = new Map();
    this.orderDataSource = new Array();
    this.itemTypesStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer.serverConfirmStep;
    this._createOrderWorkFlowMap();
    this._getItemTypes();
    this._subscribeToOrderChanges();
    this._setDataColumns();
  }

  public get orderWorkFlowEnum(): any {
    return OrderWorkflowAction;
  }

  /**
   * Gets all the item types of the order
   */
  private _getItemTypes(): void {
    this.itemTypesStatusFactory.setInProgress();
    this._orderItemTypesRepository.getAll().pipe(
      catchError((error) => {
        this.itemTypesStatusFactory.setError();
        return throwError(error);
      })
    ).subscribe((response) => {
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

  private _createOrderWorkFlowMap(): void {
    this._orderWorkFlowMap.set(OrderWorkflowAction.Submitted, this._createOrderSubmit.bind(this));
    this._orderWorkFlowMap.set(OrderWorkflowAction.Draft, this._createOrderDraft.bind(this));
  }

  private _createOrderSubmit(): Observable<McsOrder> {
    return this._serverCreateFlyweightContext
      .createOrderWorkflow(OrderWorkflowAction.Submitted);
  }

  private _createOrderDraft(): Observable<McsOrder> {
    return this._serverCreateFlyweightContext.createOrderWorkflow(OrderWorkflowAction.Draft).pipe(
      tap(() => this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Orders)]))
    );
  }
}
