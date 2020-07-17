import {
  Component,
  Input
} from '@angular/core';
import {
  McsOrder,
  RouteKey,
  OrderWorkflowSubmitStatus
} from '@app/models';
import { McsNavigationService } from '@app/core';
import { getSafeProperty } from '@app/utilities';

@Component({
  selector: 'mcs-step-manual-order-completed',
  templateUrl: 'step-manual-order-completed.component.html'
})

export class StepManualOrderCompletedComponent {
  @Input()
  public order: McsOrder;

  @Input()
  public orderWorkflowSubmitStatus: OrderWorkflowSubmitStatus;

  constructor(private _navigationService: McsNavigationService) { }

  public get orderWorkflowSubmitStatusEnum(): typeof OrderWorkflowSubmitStatus {
    return OrderWorkflowSubmitStatus;
  }

  public get orderId(): string {
    return getSafeProperty(this.order, (obj) => obj.orderId);
  }

  public onOrderIdClick(): void {
    this._navigationService.navigateTo(RouteKey.OrderDetails, [this.order.id]);
  }
}
