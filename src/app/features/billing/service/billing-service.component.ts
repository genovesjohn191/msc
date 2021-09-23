import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { BillingSummaryService } from '../billing.service';

@Component({
  selector: 'mcs-billing-service',
  templateUrl: './billing-service.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingServiceComponent implements OnInit, OnDestroy {

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
