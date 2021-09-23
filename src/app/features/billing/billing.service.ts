import {
  EventEmitter,
  Injectable
} from '@angular/core';

@Injectable()
export class BillingSummaryService {
  public accountIdChanged = new EventEmitter<string>();

  private _billingAccountId: string = '';

  public setBillingAccountId(accountId: string[]): void {
    let nextBillingAccountId = accountId?.length > 0 ? accountId[0] : '';
    if (this._billingAccountId === nextBillingAccountId) { return; }
    this._billingAccountId = nextBillingAccountId;
    this.accountIdChanged.emit(this._billingAccountId);
  }
}
