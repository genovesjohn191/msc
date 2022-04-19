import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsFilterPanelEvents,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsQueryParam,
  McsResourceMedia,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-media',
  templateUrl: './media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaComponent implements OnInit {
  public readonly dataSource: McsTableDataSource2<McsResourceMedia>;
  public readonly dataEvents: McsTableEvents<McsResourceMedia>;
  public readonly filterPanelEvents: McsFilterPanelEvents;
  public readonly defaultColumnFilters: McsFilterInfo[];

  public hasResources$: Observable<boolean>;

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    this.dataSource = new McsTableDataSource2(this._getResourceMedia.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeMedia,
      dataClearEvent: McsEvent.dataClearMedia
    });
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'media' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'mediaSize' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'uploadedDate' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'vdc' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'attachedTo' })
    ];
    this.filterPanelEvents = new McsFilterPanelEvents(_injector);
  }

  public ngOnInit() {
    this._subscribeToResources();
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSearch(value);
    }
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public get addIconKey(): string {
    return CommonDefinition.ASSETS_SVG_PLUS;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public navigateToMedia(media: McsResourceMedia): void {
    if (isNullOrEmpty(media)) { return; }
    this._navigationService.navigateTo(RouteKey.Medium, [media.id]);
  }

  public navigateToMediaUpload(): void {
    this._navigationService.navigateTo(RouteKey.MediaUpload);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _getResourceMedia(
    param: McsMatTableQueryParam
  ): Observable<McsMatTableContext<McsResourceMedia>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getMedia(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }

  private _subscribeToResources(): void {
    this.hasResources$ = this._apiService.getResources().pipe(
      map((resources) => !isNullOrEmpty(resources))
    );
  }
}
