import { Injector } from '@angular/core';
import { McsReportBillingServiceGroup } from '@app/models';

import { IBillingOperation } from './abstractions/billing-operation.interface';
import { BillingOperationType } from './models/billing-operation-type';
import { BillingServiceOperation } from './operations/billing-service.operation';
import { BillingSummaryOperation } from './operations/billing-summary.operation';

export class BillingOperationFactory {
  private _operationMap = new Map<BillingOperationType, IBillingOperation<any, any>>();

  public constructor(injector: Injector) {
    this._operationMap.set(
      BillingOperationType.Summary,
      new BillingSummaryOperation(injector)
    );

    this._operationMap.set(
      BillingOperationType.Service,
      new BillingServiceOperation(injector)
    );
  }

  public static getInstance(injector: Injector): BillingOperationFactory {
    return new BillingOperationFactory(injector);
  }

  public getServiceGroupFactory<TBillingItem>(
    billingType: BillingOperationType,
    billingGroups: McsReportBillingServiceGroup[]
  ): IBillingOperation<McsReportBillingServiceGroup, TBillingItem> {

    let operation = this._operationMap.get(billingType);
    operation.initializeData(billingGroups);
    return operation;
  }
}
