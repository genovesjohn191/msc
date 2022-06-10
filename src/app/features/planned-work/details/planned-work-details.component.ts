import { saveAs } from 'file-saver';
import {
  of,
  Observable,
  Subject,
  Subscription,
  forkJoin
} from 'rxjs';
import {
  finalize,
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
  McsListviewContext,
  McsListviewDataSource2,
  McsListviewQueryParam,
  McsNavigationService,
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsPlannedWork,
  McsPlannedWorkQueryParams,
  McsRouteInfo,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { Search } from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  compareDates
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { PlannedWorkDetailsService } from './planned-work-details.service';
import { McsApiClientConfig } from '@app/api-client';

type tabGroupType = 'overview' | 'affected-services';

interface McsPlannedWorkCategory {
  name: string;
  plannedWorkList: McsPlannedWork[];
}

@Component({
  selector: 'mcs-planned-work-details',
  templateUrl: './planned-work-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannedWorkDetailsComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsPlannedWorkCategory>;
  public selectedPlannedWork$: Observable<McsPlannedWork>;
  public selectedTabId$: Observable<string>;
  public isDownloadingIcs: boolean = false;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  public constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _config: McsApiClientConfig,
    private _eventDispatcher: EventBusDispatcherService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _plannedWorkDetailsService: PlannedWorkDetailsService,
    private _apiService: McsApiService,
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getPlannedWorkList.bind(this),
      {
        sortPredicate: this._sortPlannedWorkPredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('plannedWorkListing.loading'),
          emptyText: _translate.instant('plannedWorkListing.noRecordsFoundMessage'),
          errorText: _translate.instant('plannedWorkListing.errorMessage')
        }
      }
    );
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToPlannedWorkResolver();
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
          RouteKey.PlannedWorkDetails,
          [this._plannedWorkDetailsService.getPlannedWorkId(), tab.id as tabGroupType]
        );
        break;
      case 'affected-services':
        this._navigationService.navigateTo(
          RouteKey.PlannedWorkDetails,
          [this._plannedWorkDetailsService.getPlannedWorkId(), tab.id as tabGroupType]
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

  public get tracksPlannedWorkUrl(): string {
    let tracksUrl = "";
    let isRunningInlab = this._config.apiHost.match('lab');
    if (isRunningInlab) {
      tracksUrl = CommonDefinition.TRACKS_DEV_URL;
    } else {
      tracksUrl = CommonDefinition.TRACKS_PROD_URL;
    }
    return `${tracksUrl}/change_task.do?sys_id=`;
  }
  
  public get selectedPlannedWorkId(): string {
    return this._plannedWorkDetailsService.getPlannedWorkId();
  }

  public downloadIcs(): void{
    this.isDownloadingIcs = true;
    let id = this._plannedWorkDetailsService.getPlannedWorkId();
    this._apiService.getPlannedWorkIcs(id)
        .pipe(
          finalize(() => {
            this.isDownloadingIcs = false;
          }) 
        )
        .subscribe(blobResponse => {
          saveAs(blobResponse, this._plannedWorkDetailsService.getPlannedWorkIcsFileName());
        });
  }

  public openTracks(uuid: string): string {
    let plannedWorkId = uuid.replace(/-/g, "");
    return `${this.tracksPlannedWorkUrl}${plannedWorkId}`
  }

  private _getPlannedWorkList(
    param: McsListviewQueryParam
  ): Observable<McsListviewContext<McsPlannedWorkCategory>> {
    let currentFutureQueryParam = new McsPlannedWorkQueryParams();
    currentFutureQueryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    currentFutureQueryParam.category = 'currentfuture';

    let pastQueryParam = new McsPlannedWorkQueryParams();
    pastQueryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    pastQueryParam.category = 'past';

    return forkJoin([
        this._apiService.getPlannedWork(currentFutureQueryParam),
        this._apiService.getPlannedWork(pastQueryParam)
      ]).pipe(
      map(results => {
        let currentFuturePlannedWork = results[0];
        let pastPlannedWork = results[1];

        let categories = new Array<McsPlannedWorkCategory>();
        categories.push({
          name: 'Current and Future',
          plannedWorkList: currentFuturePlannedWork?.collection
        });
        categories.push({name: 'Past',
          plannedWorkList: pastPlannedWork?.collection
        });
        return new McsListviewContext<McsPlannedWorkCategory>(categories);
      })
    );
  }
  
  private _subscribeToPlannedWorkResolver(): void {
    this.selectedPlannedWork$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.plannedWork) as McsPlannedWork),
      tap((plannedWork) => {
        if (isNullOrEmpty(plannedWork)) { return; }
        this._plannedWorkDetailsService.setPlannedWorkDetails(plannedWork);
      }),
      shareReplay(1)
    );
  }

  private _sortPlannedWorkPredicate(first: McsPlannedWork, second: McsPlannedWork): number {
    return compareDates(first.plannedStart, second.plannedStart);
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