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

@Component({
  selector: 'mcs-billing-summary',
  templateUrl: './billing-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingSummaryComponent implements OnInit, OnDestroy {
  private _destroySubject = new Subject<void>();

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService
  ) {
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public onUpdateChart(data: any): void {
    console.log('on chart change', data);
  }
}
