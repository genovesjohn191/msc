import {
  Subject,
  Observable
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  pairwise
} from 'rxjs/operators';
import {
  isNullOrUndefined,
  compareJsons,
  getSafeProperty,
  isNullOrEmpty,
  cloneObject
} from '@app/utilities';
import { McsOrderBuilder } from './mcs-order.builder';
import { McsOrderRequest } from './mcs-order-request';

export enum OrderStateChange {
  NoChanged = 2,
  Changed = 3
}

const ORDER_CHANGE_INTERVAL = 3000;

export class McsOrderDirector {
  private _orderRequestReceived = new Subject<McsOrderRequest>();

  /**
   * Event that emits when the order request has been changed
   * @note The request change has an interval of 3seconds before it was fully checked
   */
  public orderRequestChange(): Observable<McsOrderRequest> {
    return this._orderRequestReceived.pipe(
      debounceTime(ORDER_CHANGE_INTERVAL),
      distinctUntilChanged((prev, next) => {
        return compareJsons(prev, next) === 0;
      })
    );
  }

  /**
   * Event that emits when the order request has been changed prior
   * @note The request pre-change doesnt have any delay
   */
  public orderRequestStateChange(): Observable<OrderStateChange> {
    return this._orderRequestReceived.pipe(
      pairwise(),
      map(([previousRequest, currentRequest]) => {
        return compareJsons(previousRequest, currentRequest) === 0 ?
          OrderStateChange.NoChanged : OrderStateChange.Changed;
      })
    );
  }

  /**
   * Constructs the order based on the data set
   * @param orderBuilder Order builder to be built
   */
  public construct(orderBuilder: McsOrderBuilder): void {
    if (isNullOrUndefined(orderBuilder)) { return; }
    orderBuilder
      .buildOrderDetails()
      .buildOrderItem();

    let orderItems = getSafeProperty(orderBuilder,
      (obj) => obj.orderRequestDetails.orderDetails.items
    );

    if (!isNullOrEmpty(orderItems)) {
      this._orderRequestReceived.next(
        cloneObject(orderBuilder.orderRequestDetails)
      );
    }
  }
}
