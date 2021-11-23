import {
  Injectable,
  Injector
} from '@angular/core';
import { McsReportBillingServiceGroup } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

import { IBillingOperation } from './abstractions/billing-operation.interface';
import { BillingOperationFactory } from './billing-operation.factory';
import { BillingOperationType } from './models/billing-operation-type';
import { BillingServiceItem } from './models/billing-service-item';
import { BillingSummaryItem } from './models/billing-summary-item';

@Injectable()
export class BillingOperationService {
  public summaryOperation: IBillingOperation<McsReportBillingServiceGroup, BillingSummaryItem>;
  public serviceOperation: IBillingOperation<McsReportBillingServiceGroup, BillingServiceItem>;

  private _billingServiceGroupsCache = new Array<McsReportBillingServiceGroup>();

  constructor(private _injector: Injector) { }

  public initializeBillingServiceGroups(
    billingServiceGroups: McsReportBillingServiceGroup[]
  ): void {
    if (!isNullOrEmpty(this._billingServiceGroupsCache)) { return; }
    this._billingServiceGroupsCache = billingServiceGroups;

    this.summaryOperation = BillingOperationFactory
      .getInstance(this._injector)
      .createServiceGroupFactory(BillingOperationType.Summary, this._billingServiceGroupsCache);

    this.serviceOperation = BillingOperationFactory
      .getInstance(this._injector)
      .createServiceGroupFactory(BillingOperationType.Service, this._billingServiceGroupsCache);
  }
}