import {
  EventEmitter,
  Injectable,
  Output
} from '@angular/core';

@Injectable()
export class BillingSummaryService {

  @Output()
  public accountIdChanged = new EventEmitter<string>();

  private _billingAccountId: string = '';

  public setBillingAccountId(accountId: string[]): void {
    this._billingAccountId = accountId.join();
    this.accountIdChanged.emit(this._billingAccountId);
  }

  public getBillingAccountId(): string {
    return this._billingAccountId;
  }
}
