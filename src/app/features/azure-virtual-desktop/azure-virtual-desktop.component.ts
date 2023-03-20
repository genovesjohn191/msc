import {
  BehaviorSubject,
  Subject
} from 'rxjs';
import {
  finalize,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  debounceTime
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  McsPageBase,
  McsTabEvents
} from '@app/core';
import { FieldSelectBillingAccountComponent } from '@app/features-shared';
import {
  McsReportBillingServiceGroup,
  RouteKey
} from '@app/models';
import {
  isNullOrEmpty,
  DataProcess
} from '@app/utilities';

import {
  AzureVirtualDesktopService,
  TabGroupType
} from './azure-virtual-desktop.service';

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

  @ViewChild('selectBillingRef', { static: false })
  private _selectBillingRef: FieldSelectBillingAccountComponent

  public constructor(
    injector: Injector,
    private _avdService: AzureVirtualDesktopService
  ) {
    super(injector);
    this.tabEvents = new McsTabEvents(injector);
  }

  public get featureName(): string {
    return 'azure-virtual-desktop';
  }

  public ngOnInit(): void {
    this._subscribeToBillingAccountChange();
    this.tabEvents.initialize();
  }

  public ngOnDestroy(): void {
    this.dispose();
    this.tabEvents.dispose();

    this._billingServicesCache.next(null);
  }

  public get graphDataProcess(): any  {
    return this._avdService.dataProcess;
  }

  public onTabChanged(tab: any) {
    this.navigation.navigateTo(RouteKey.Avd, [tab.id as TabGroupType]);
  }

  public onClickExportCsv(): void {
    this.tabEvents?.selectedTabId$.pipe(
      take(1),
      switchMap(selectedTab => {
        this.exportProcess.setInProgress();
        return this._avdService.exportCsvByTab(selectedTab as TabGroupType).pipe(
          finalize(() => this.exportProcess.setCompleted())
        );
      })
    ).subscribe();
  }

  private _subscribeToBillingAccountChange(): void {
    this.fcBillingAccount.valueChanges.pipe(
      debounceTime(1500),
      takeUntil(this._destroySubject),
      startWith([null]),
      tap(accountIds => {
        let targetAccountId = this._selectBillingRef?.allAccountsAreSelected ? null :
          isNullOrEmpty(accountIds) ? null : accountIds[0];
        this._avdService.setBillingAccountId(targetAccountId);
      })
    ).subscribe();
  }
}
