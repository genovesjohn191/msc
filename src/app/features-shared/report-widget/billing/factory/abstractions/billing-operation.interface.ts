import { Observable } from 'rxjs';

import { BillingOperationData } from '../models/billing-operation-data';

export interface IBillingOperation<TApiEntity, TBillingData> {
  initializeData(group: TApiEntity[]): void;

  getOperationData(): BillingOperationData<TBillingData>;
  operationDataChange(): Observable<BillingOperationData<TBillingData>>;

  filterOperationData(filterPred: (item: TBillingData) => boolean): void;
  reset(): void;
}
