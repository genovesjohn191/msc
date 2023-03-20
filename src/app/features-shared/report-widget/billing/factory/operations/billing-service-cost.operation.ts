import { Injector } from '@angular/core';
import {
  McsOption,
  McsReportBillingServiceGroup
} from '@app/models';
import { ChartItem } from '@app/shared';

import { IBillingOperation } from '../abstractions/billing-operation.interface';
import {
  BillingOperationViewModel,
  BillingServiceItem
} from '../models';
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

  protected viewModelFunc(item: BillingServiceItem): BillingOperationViewModel {
    return new BillingOperationViewModel(
      `${item.billingDescription} - ${item.serviceId}`,
      [
        new McsOption(
          this.currencyPipe.transform(item.gstExclusiveChargeDollars),
          this.translate.instant('label.totalCost')
        ),
        new McsOption(
          item.userQuantity,
          this.translate.instant('label.users')
        ),
        new McsOption(
          item.minimumCommitmentUsers,
          this.translate.instant('label.minimumUserCommitment')
        ),
        new McsOption(
          this.currencyPipe.transform(item.chargePerUserDollars),
          this.translate.instant('label.chargePerUser')
        ),
        new McsOption(
          item.plan,
          this.translate.instant('label.plan')
        ),
        new McsOption(
          item.tenantName,
          this.translate.instant('label.tenantName')
        ),
        new McsOption(
          item.initialDomain,
          this.translate.instant('label.initialDomain')
        ),
        new McsOption(
          item.primaryDomain,
          this.translate.instant('label.primaryDomain')
        ),
        new McsOption(
          item.microsoftIdentifier || 'Unknown',
          this.translate.instant('label.microsoftIdentifier')
        ),
        new McsOption(
          item.microsoftChargeMonth,
          this.translate.instant('label.microsoftChargeMonth')
        ),
        new McsOption(
          item.macquarieBillMonth,
          this.translate.instant('label.macquarieBillMonth')
        ),
        new McsOption(
          item.serviceId,
          this.translate.instant('label.serviceId')
        )
      ],
      false
    );
  }
}