import {
  Injector,
  Injectable
} from '@angular/core';
import { OrderEventType } from './strategy/order-event.type';
import { IOrderEventStrategy } from './strategy/order-event.strategy';

import { OrderEventContext } from './strategy/order-event.context';
import { OrderDeployVmEvent } from './strategy/events/order-deploy-vm.event';
import { OrderExpandVdcStorageEvent } from './strategy/events/order-expand-vdc-storage.event';
import { OrderRaiseInviewLevelEvent } from './strategy/events/order-raise-inview-level.event';
import { OrderScaleVdcEvent } from './strategy/events/order-scale-vdc.event';
import { OrderScaleVmEvent } from './strategy/events/order-scale-vm.event';
import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class OrderDashboardService {

  private _orderEventStrategyMap: Map<OrderEventType, IOrderEventStrategy>;
  private _orderEventContext: OrderEventContext;

  constructor(_injector: Injector) {
    this._orderEventContext = new OrderEventContext(_injector);
    this._createOrderEventMap();
  }

  /**
   * Executes the ordering event based on its type
   * @param type Type of the order to be invoked
   */
  public executeEventByType(type: OrderEventType): void {
    let eventStrategyFound = this._orderEventStrategyMap.get(type);
    if (isNullOrEmpty(eventStrategyFound)) {
      throw new Error(`Unable to find the event strategy for ${eventStrategyFound}`);
    }
    this._orderEventContext.setEventStrategy(eventStrategyFound);
    this._orderEventContext.executeEvent();
  }

  /**
   * Creates order event maps
   */
  private _createOrderEventMap(): void {
    this._orderEventStrategyMap = new Map();

    this._orderEventStrategyMap.set('deployCloudVm', new OrderDeployVmEvent());
    this._orderEventStrategyMap.set('expandVdcStorage', new OrderExpandVdcStorageEvent());
    this._orderEventStrategyMap.set('raiseInviewLevel', new OrderRaiseInviewLevelEvent());
    this._orderEventStrategyMap.set('scaleVdc', new OrderScaleVdcEvent());
    this._orderEventStrategyMap.set('scaleVm', new OrderScaleVmEvent());
  }
}
