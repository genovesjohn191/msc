import { FormControl } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import {
  of,
  Observable,
  Subscription,
  Subject
} from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsRouteInfo,
  RouteKey
} from '@app/models';
import {
  CommonDefinition,
  getSafeProperty,
  unsubscribeSafely
} from '@app/utilities';
import { BillingSummaryService } from './billing.service';
import { TranslateService } from '@ngx-translate/core';

type tabGroupType = 'summary' | 'service' | 'tabular';

@Component({
  selector: 'mcs-billing',
  templateUrl: './billing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent implements OnInit, OnDestroy {
  public selectedTabId$: Observable<string>;

  public fcBillingAccount: FormControl;

  private _routerHandler: Subscription;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _billingSummaryService: BillingSummaryService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService,
    private _translate: TranslateService
  ) {
    this._registerEvents();
    this._registerFormControl();
    this._subscribeToBillingAccountControlChanges();
  }

  public get headerDescription(): string {
    return this._translate.instant('reports.billing.description');
  }

  public get headerSecondDescription(): string {
    return this._translate.instant('reports.billing.secondDescription');
  }

  public get learnMoreLink(): string {
    return this._translate.instant('reports.billing.learnMoreLink');
  }

  public get statusIconKey(): string {
    return CommonDefinition.ASSETS_SVG_INFO;
  }

  public ngOnInit(): void {
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any) {
    this._navigationService.navigateTo(
      RouteKey.Billing,
      [tab.id as tabGroupType]
    );
  }

  private _registerEvents(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });
  }

  private _registerFormControl(): void {
    this.fcBillingAccount = new FormControl('', []);
  }

  private _subscribeToBillingAccountControlChanges(): void {
    this.fcBillingAccount.valueChanges.pipe(
      takeUntil(this._destroySubject),
    ).subscribe(change => {
      this._onBillingAccountIdChange(change);
    });
  }

  private _onBillingAccountIdChange(accountIds: string[]): void {
    this._billingSummaryService.setBillingAccountId(accountIds);
  }
}
