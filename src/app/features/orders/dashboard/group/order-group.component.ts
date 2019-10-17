import {
  Component,
  ChangeDetectionStrategy,
  Injector,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  McsOrderAvailableGroup,
  McsOrderAvailableItemType,
  OrderType
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { OrderEventContext } from './strategy/order-event.context';

interface OrderGroupDetails {
  changeOrders: McsOrderAvailableItemType[];
  newOrders: McsOrderAvailableItemType[];
}

@Component({
  selector: 'mcs-order-group',
  templateUrl: './order-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrderGroupComponent implements OnChanges {

  @Input()
  public orderGroup: McsOrderAvailableGroup;
  public orderGroupDetails$: Observable<OrderGroupDetails>;

  private _strategyContext: OrderEventContext;

  constructor(_injector: Injector) {
    this._strategyContext = new OrderEventContext(_injector);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let orderGroupChange = changes['orderGroup'];
    if (!isNullOrEmpty(orderGroupChange)) {
      this._subscribeToOrderGroup();
    }
  }

  public executeOrderAvailable(type: string): void {
    this._strategyContext.setEventStrategyByType(type);
    this._strategyContext.executeEvent();
  }

  private _subscribeToOrderGroup(): void {
    let groupDetails: OrderGroupDetails = { newOrders: [], changeOrders: [] };
    let orderAvailableItemTypes = getSafeProperty(this.orderGroup, (obj) => obj.availableOrderItemTypes, []);

    orderAvailableItemTypes.forEach((orderItem) => {
      orderItem.orderType === OrderType.Change ?
        groupDetails.changeOrders.push(orderItem) :
        groupDetails.newOrders.push(orderItem);
    });
    this.orderGroupDetails$ = of(groupDetails);
  }
}