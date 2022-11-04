import {
  Injector,
  NgZone
} from '@angular/core';

import { IBillingOperation } from './abstractions/billing-operation.interface';
import { BillingOperationType } from './models/billing-operation-type';
import { BillingAvdDailyConnectionsOperation } from './operations/billing-avd-daily-connections.operation';
import { BillingAvdDailyUserAverageOperation } from './operations/billing-avd-daily-user-average.operation';
import { BillingAvdDailyUserServiceOperation } from './operations/billing-avd-daily-user-service.operation';
import { BillingServiceCostOperation } from './operations/billing-service-cost.operation';
import { BillingServiceOperation } from './operations/billing-service.operation';
import { BillingSummaryOperation } from './operations/billing-summary.operation';

export class BillingOperationFactory {
  private readonly _ngZone: NgZone;

  private _operationMap = new Map<BillingOperationType, IBillingOperation<any, any>>();

  public constructor(injector: Injector) {
    this._ngZone = injector.get(NgZone);

    this._operationMap.set(
      BillingOperationType.Summary,
      new BillingSummaryOperation(injector)
    );

    this._operationMap.set(
      BillingOperationType.Service,
      new BillingServiceOperation(injector)
    );

    this._operationMap.set(
      BillingOperationType.ServiceCost,
      new BillingServiceCostOperation(injector)
    );

    this._operationMap.set(
      BillingOperationType.DailyUserService,
      new BillingAvdDailyUserServiceOperation(injector)
    );

    this._operationMap.set(
      BillingOperationType.DailyUserAverage,
      new BillingAvdDailyUserAverageOperation(injector)
    );

    this._operationMap.set(
      BillingOperationType.DailyConnectionService,
      new BillingAvdDailyConnectionsOperation(injector)
    );
  }

  public static getInstance(injector: Injector): BillingOperationFactory {
    return new BillingOperationFactory(injector);
  }

  public createServiceGroupFactory<TApiItem, TBillingItem>(
    billingType: BillingOperationType,
    apiDataRecords: TApiItem[]
  ): IBillingOperation<TApiItem, TBillingItem> {
    let operation = this._operationMap.get(billingType);

    // We need to run it outside the angular zone
    // to prevent freezing the ui.
    this._ngZone.runOutsideAngular(() => {
      operation.initializeData(apiDataRecords);
    });
    return operation;
  }
}
