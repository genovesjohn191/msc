import { Subject } from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { unsubscribeSafely } from '@app/utilities';
import { BillingSummaryService } from '../billing.service';

@Component({
  selector: 'mcs-billing-summary',
  templateUrl: './billing-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingSummaryComponent implements OnInit, OnDestroy {
  private _destroySubject = new Subject<void>();

  public billingAccountId: string;

  public constructor(
    private _billingSummaryService: BillingSummaryService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService
  ) {
    this.billingAccountId = this._billingSummaryService.getBillingAccountId();
  }

  public ngOnInit(): void {
    this._subscribeToBillingAccountIdChange();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public onUpdateChart(data: any): void {
    console.log('on chart change', data);
  }

  private _subscribeToBillingAccountIdChange(): void {
    this._billingSummaryService.accountIdChanged.subscribe((accountId) => {
      this.billingAccountId = accountId;
      this._changeDetectorRef.markForCheck();
    })
  }
}
