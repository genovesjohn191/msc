import { Injector } from '@angular/core';
import {
  McsOption,
  McsReportBillingAvdDailyUser
} from '@app/models';
import { ChartItem } from '@app/shared';
import { getDateOnly } from '@app/utilities';

import { IBillingOperation } from '../abstractions/billing-operation.interface';
import { BillingOperationViewModel } from '../models';
import {
  BillingAvdDailyUserServiceItem,
  BillingAvdDailyUserServiceOperation
} from './billing-avd-daily-user-service.operation';

export class BillingAvdDailyConnectionsOperation
  extends BillingAvdDailyUserServiceOperation
  implements IBillingOperation<McsReportBillingAvdDailyUser, BillingAvdDailyUserServiceItem> {

  constructor(injector: Injector) {
    super(injector);
  }

  /**
   * Overrides the creation of chart items from the base class
   */
   protected mapToChartItem(item: BillingAvdDailyUserServiceItem): ChartItem {
    let chartItem = super.mapToChartItem(item);
    chartItem.yValue = item.connections;
    return chartItem;
  }

  protected viewModelFunc(item: BillingAvdDailyUserServiceItem): BillingOperationViewModel {
    return new BillingOperationViewModel(
      `${item.billingDescription} - ${item.serviceId}`,
      [
        new McsOption(item.connections, 'Connections'),
        new McsOption(item.plan, 'Plan'),
        new McsOption(item.tenantName, 'Tenant Name'),
        new McsOption(item.tenantInitialDomain, 'Initial Domain'),
        new McsOption(item.tenantPrimaryDomain, 'Primary Domain'),
        new McsOption(item.microsoftId, 'Microsoft Identifier'),

        // TODO: Check this out, microsoft charge month and bill was not in user daily service
        // new McsOption(item.microsoftChargeMonth, 'Microsoft Charge Month'),
        // new McsOption(item.macquarieBillMonth, 'Macquarie Bill Month'),
        new McsOption(this.datePipe.transform(getDateOnly(item.date), 'dayMonth'), 'Date'),
        new McsOption(item.serviceId, 'Service ID')
      ],
      false
    );
  }
}