import {
  BehaviorSubject,
  Subject
} from 'rxjs';
import {
  startWith,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  McsPageBase,
  McsTabEvents
} from '@app/core';
import {
  McsReportBillingServiceGroup,
  RouteKey
} from '@app/models';
import { StdDateFormatPipe } from '@app/shared';
import {
  isNullOrEmpty,
  DataProcess
} from '@app/utilities';

import { AzureVirtualDesktopService } from './azure-virtual-desktop.service';

// Note: this should match the routing path under constants def.
type tabGroupType = 'daily-user-service' | 'daily-user-average' | 'service-cost' | 'daily-connection-service';

@Component({
  selector: 'mcs-avd',
  templateUrl: './azure-virtual-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureVirtualDesktopComponent extends McsPageBase implements OnInit, OnDestroy {
  public readonly tabEvents: McsTabEvents;
  public readonly exportProcess = new DataProcess();
  public readonly fcBillingAccount = new FormControl<string[]>(null);;

  private _destroySubject = new Subject<void>();
  private _billingServicesCache = new BehaviorSubject<Array<McsReportBillingServiceGroup>>(null);

  public constructor(
    private _injector: Injector,
    private _avdService: AzureVirtualDesktopService,
    private _datePipe: StdDateFormatPipe,
  ) {
    super(_injector);
    this.tabEvents = new McsTabEvents(_injector);
  }

  public get featureName(): string {
    return 'azure-virtual-desktop';
  }

  public ngOnInit(): void {
    this._subscribeToBillingAccountChange();
  }

  public ngOnDestroy(): void {
    this.dispose();
    this.tabEvents.dispose();

    this._billingServicesCache.next(null);
  }

  public onTabChanged(tab: any) {
    this.navigation.navigateTo(RouteKey.Avd, [tab.id as tabGroupType]);
  }

  private _subscribeToBillingAccountChange(): void {
    this.fcBillingAccount.valueChanges.pipe(
      takeUntil(this._destroySubject),
      startWith([null]),
      tap(accountIds => {
        this._avdService.setBillingAccountId(isNullOrEmpty(accountIds) ? null : accountIds[0]);
      })
    ).subscribe();
  }
}
