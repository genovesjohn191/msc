import { Injector } from '@angular/core';
import { McsReportBillingServiceGroup } from '@app/models';
import { ChartItem } from '@app/shared';

import { IBillingOperation } from '../abstractions/billing-operation.interface';
import { BillingServiceItem } from '../models';
import { BillingServiceOperation } from './billing-service.operation';

export class BillingServiceCostOperation
  extends BillingServiceOperation
  implements IBillingOperation<McsReportBillingServiceGroup, BillingServiceItem> {

  constructor(injector: Injector) {
    super(injector);
  }

  /**
   * Overrides the creation of chart items from the base class
   */
   protected mapToChartItem(item: BillingServiceItem): ChartItem {
    let chartItem = super.mapToChartItem(item);
    // TODO: Need to check the month and cost with Daniel
    return chartItem;
  }
}