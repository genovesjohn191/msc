import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input
} from '@angular/core';
import { McsOrderItemType } from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';

@Component({
  selector: 'mcs-item-order-lead-time',
  templateUrl: './order-item-lead-time.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'order-approval-wrapper'
  }
})

export class OrderItemLeadTimeComponent {
  @Input()
  public orderItemType: McsOrderItemType;

  public get hasStandardTime(): boolean {
    return !isNullOrEmpty(this.standardLeadTimeHours);
  }

  public get standardLeadTimeHours(): number {
    return getSafeProperty(this.orderItemType, (obj) => obj.standardLeadTimeHours, 0);
  }

  public get hasAcceleratedTime(): boolean {
    return !isNullOrEmpty(this.acceleratedLeadTimeHours);
  }

  public get acceleratedLeadTimeHours(): number {
    return getSafeProperty(this.orderItemType, (obj) => obj.acceleratedLeadTimeHours, 0);
  }
}
