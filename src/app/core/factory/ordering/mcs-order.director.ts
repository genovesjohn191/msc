import {
  Observable,
  Subject
} from 'rxjs';
import {
  distinctUntilChanged,
  tap
} from 'rxjs/operators';

import {
  cloneObject,
  compareJsons,
  debounceTimeAfterFirst,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

import { McsOrderRequest } from './mcs-order-request';
import { McsOrderBuilder } from './mcs-order.builder';

export enum OrderStateChange {
  Started = 2,
  Ended = 3
}

const ORDER_CHANGE_INTERVAL = 3000;

export class McsOrderDirector {
  private _orderRequestReceived = new Subject<McsOrderRequest>();
  private _orderRequestState = new Subject<OrderStateChange>();

  /**
   * Event that emits when the order request has been changed
   * @note The request change has an interval of 3seconds before it was fully checked
   */
  public orderRequestChange(): Observable<McsOrderRequest> {
    return this._orderRequestReceived.pipe(
      tap(() => this._orderRequestState.next(OrderStateChange.Started)),
      debounceTimeAfterFirst(ORDER_CHANGE_INTERVAL),
      tap(() => this._orderRequestState.next(OrderStateChange.Ended)),
      distinctUntilChanged((prev, next) => compareJsons(prev, next) === 0)
    );
  }

  /**
   * Event that emits when the order request has been changed prior
   * @note The request pre-change doesnt have any delay
   */
  public orderRequestStateChange(): Observable<OrderStateChange> {
    return this._orderRequestState.asObservable();
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
