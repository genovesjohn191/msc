import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

import { OrderEventType } from './strategy/order-event.type';
import { OrderDashboardService } from './order-dashboard.service';

@Component({
  selector: 'mcs-order-dashboard',
  templateUrl: './order-dashboard.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OrderDashboardService],
  host: {
    'class': 'order-dashboard-wrapper'
  }
})

export class OrderDashboardComponent {

  constructor(private _orderDashboardService: OrderDashboardService) { }

  /**
   * Executes the order process associated with the type
   * @param event Event of the mouse that triggers the click event
   * @param type Type of the order event to be executed
   */
  public executeOrderProcess(event: MouseEvent, type: OrderEventType): void {
    if (!isNullOrEmpty(event)) { event.preventDefault(); }
    this._orderDashboardService.executeEventByType(type);
  }
}
