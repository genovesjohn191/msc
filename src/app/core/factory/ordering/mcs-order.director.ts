import {
  Subject,
  Observable
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged
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

const ORDER_CHANGE_INTERVAL = 3000;

export class McsOrderDirector {
  private _orderRequestReceived = new Subject<McsOrderRequest>();

  /**
   * Event that emits when the order has been requested
   */
  public orderRequestReceived(): Observable<McsOrderRequest> {
    return this._orderRequestReceived.pipe(
      debounceTime(ORDER_CHANGE_INTERVAL),
      distinctUntilChanged((prev, next) => {
        return compareJsons(prev, next) === 0;
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
