import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  ViewChild
} from '@angular/core';
import { Sort } from '@angular/material/sort';
import {
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
  public readonly defaultColumnFilters: McsFilterInfo[];

  public hasResources$: Observable<boolean>;
  public isSorting: boolean;

  private _sortDirection: string;
  private _sortField: string;

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

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  private _getResourceMedia(
    param: McsMatTableQueryParam
  ): Observable<McsMatTableContext<McsResourceMedia>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._apiService.getMedia(queryParam).pipe(
      catchError((error) => {
        this.isSorting = false;
        return throwError(error);
      }),
      map(response => {
        this.isSorting = false;
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
