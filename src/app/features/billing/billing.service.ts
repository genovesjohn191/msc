import { BehaviorSubject } from 'rxjs';

import {
  EventEmitter,
  Injectable
} from '@angular/core';
import { McsDataStatusFactory } from '@app/core';
import { McsReportBillingServiceGroup } from '@app/models';

@Injectable()
export class BillingSummaryService {
  public billingSummaryProcessingStatus = new McsDataStatusFactory<any>();
  public billingSummariesChange = new BehaviorSubject<McsReportBillingServiceGroup[]>(null);
  public accountIdChanged = new EventEmitter<string>();

  private _billingAccountId: string = '';

  public setBillingAccountId(accountId: string[]): void {
    let nextBillingAccountId = accountId?.length > 0 ? accountId[0] : '';
    if (this._billingAccountId === nextBillingAccountId) { return; }
    this._billingAccountId = nextBillingAccountId;
    this.accountIdChanged.emit(this._billingAccountId);
  }

  public setBillingSummaries(billingSummaries: McsReportBillingServiceGroup[]): void {
    this.billingSummariesChange.next(billingSummaries);
  }
}
