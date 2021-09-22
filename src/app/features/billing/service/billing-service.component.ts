import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';

@Component({
  selector: 'mcs-billing-service',
  templateUrl: './billing-service.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingServiceComponent implements OnInit, OnDestroy {

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService
  ) {
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
  }

  public onUpdateChart(data: any): void {
    console.log('on chart change', data);
  }
}
