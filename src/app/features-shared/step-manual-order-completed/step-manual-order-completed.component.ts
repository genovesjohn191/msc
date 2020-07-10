import {
  Component,
  Input
} from '@angular/core';
import {
  McsOrder,
  RouteKey} from '@app/models';
import { McsNavigationService } from '@app/core';
import { getSafeProperty } from '@app/utilities';

@Component({
  selector: 'mcs-step-manual-order-completed',
  templateUrl: 'step-manual-order-completed.component.html'
})

export class StepManualOrderCompletedComponent {

  @Input()
  public order: McsOrder;

  constructor( private _navigationService: McsNavigationService) { }

  public get orderId(): string {
    return getSafeProperty(this.order, (obj) => obj.orderId);
  }

  public get hasError(): boolean {
    return getSafeProperty(this.order, (obj) => obj.hasErrors);
  }

  public onOrderIdClick(): void {
    this._navigationService.navigateTo(RouteKey.OrderDetails, [this.order.id]);
  }
}
