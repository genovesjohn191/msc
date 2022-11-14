import {
  of,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  McsAccessControlService,
  McsListviewContext,
  McsListviewDataSource2,
  McsListviewQueryParam,
  McsNavigationService,
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsStorageSaasBackup,
  McsRouteInfo,
  RouteKey,
  McsQueryParam,
  McsPermission
} from '@app/models';
import { McsApiService } from '@app/services';
import { Search } from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  compareStrings
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { SaasBackupService } from './saas-backup.service';

type tabGroupType = 'overview' | 'management';

@Component({
  selector: 'mcs-saas-backup',
  templateUrl: './saas-backup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaasBackupComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsStorageSaasBackup>;
  public selectedSaasBackup$: Observable<McsStorageSaasBackup>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  public constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _accessControlService: McsAccessControlService,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService,
    private _saasBackupService: SaasBackupService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getSaasBackupList.bind(this),
      {
        sortPredicate: this._sortSaasBackupPredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('saasBackup.loading'),
          emptyText: _translate.instant('saasBackup.noData'),
          errorText: _translate.instant('saasBackup.errorMessage')
        }
      }
    );
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToSaasBackupResolver();
  }

  public ngOnDestroy() {
    this.listviewDatasource.disconnect(null);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any) {
    switch(tab.id){
      case 'overview':
        this._navigationService.navigateTo(
          RouteKey.SaasBackupDetails,
          [this._saasBackupService.getSaasBackupId(), tab.id as tabGroupType]
        );
        break;
      case 'management':
        this._navigationService.navigateTo(
          RouteKey.SaasBackupDetails,
          [this._saasBackupService.getSaasBackupId(), tab.id as tabGroupType]
        );
        break;
    }
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.listviewDatasource.registerSearch(value);
    }
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get selectedSaasBackupId(): string {
    return this._saasBackupService.getSaasBackupId();
  }

  public validToShowContextMenuItems(saasBackup: McsStorageSaasBackup): boolean {
    return !isNullOrEmpty(saasBackup.portalUrl) ||
      (this._accessControlService.hasPermission([McsPermission.OrderEdit]) &&
        !isNullOrEmpty(saasBackup.serviceId) &&
        saasBackup.serviceChangeAvailable) ||
      (this._accessControlService.hasPermission([McsPermission.TicketCreate]) &&
        !isNullOrEmpty(saasBackup.serviceId));
  }

  private _getSaasBackupList(
    param: McsListviewQueryParam
  ): Observable<McsListviewContext<McsStorageSaasBackup>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getSaasBackups(queryParam).pipe(
      map((saasBackups) => {
        return new McsListviewContext<McsStorageSaasBackup>(
          saasBackups?.collection
        );
      })
    );
  }
  
  private _subscribeToSaasBackupResolver(): void {
    this.selectedSaasBackup$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.saasBackup) as McsStorageSaasBackup),
      tap((saasBackup) => {
        if (isNullOrEmpty(saasBackup)) { return; }
        this._saasBackupService.setSaasBackup(saasBackup);
      }),
      shareReplay(1)
    );
  }

  private _sortSaasBackupPredicate(first: McsStorageSaasBackup, second: McsStorageSaasBackup): number {
    return compareStrings(first.billingDescription, second.billingDescription);
  }

  private _registerEvents(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
    });
  }
}