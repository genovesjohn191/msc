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
  selector: 'mcs-billing-tabular',
  templateUrl: './billing-tabular.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingTabularComponent implements OnInit, OnDestroy {

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
}
