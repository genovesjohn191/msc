import {
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { unsubscribeSafely } from '@app/utilities';

import { BillingSummaryService } from '../billing.service';

@Component({
  selector: 'mcs-billing-summary',
  templateUrl: './billing-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingSummaryComponent implements OnInit, OnDestroy {
  public billingAccountId$: Observable<string>;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _billingSummaryService: BillingSummaryService
  ) {
  }

  public ngOnInit(): void {
    this._subscribeToBillingAccountIdChange();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public onUpdateChart(data: any): void {
  }

  private _subscribeToBillingAccountIdChange(): void {
    this.billingAccountId$ = this._billingSummaryService.accountIdChanged.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
