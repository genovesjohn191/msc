import {
  throwError,
  Observable
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
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsAzureResource,
  McsAzureResourceQueryParams,
  McsAzureResourceTag,
  McsFilterInfo,
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
  selector: 'mcs-azure-resources',
  templateUrl: './azure-resources.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureResourcesComponent extends McsPageBase {

  public readonly dataSource: McsTableDataSource2<McsAzureResource>;
  public readonly dataEvents: McsTableEvents<McsAzureResource>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'name' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
    createObject(McsFilterInfo, { value: false, exclude: false, id: 'resourceGroup' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'subscription' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'subscriptionId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'tags' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  public tagName: string;
  public tagValue: string;

  constructor(
    _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getAzureResources.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeAzureResources
    });
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

  public get featureName(): string {
    return 'azureResources';
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  /**
   * Navigate to request change
   */
  public onRequestChange(resource: McsAzureResource): void {
    return isNullOrEmpty(resource.serviceId && resource.azureId) ?
      this._navigationService.navigateTo(RouteKey.OrderMsRequestChange) :
      this._navigationService.navigateTo(RouteKey.OrderMsRequestChange, [], {
        queryParams: {
          serviceId: resource.serviceId,
          resourceId: resource.azureId
        }
      });
  }

  /**
   * Navigate to create a ticket
   */
  public onRaiseTicket(resource: McsAzureResource): void {
    return isNullOrEmpty(resource.serviceId) ?
      this._navigationService.navigateTo(RouteKey.TicketCreate) :
      this._navigationService.navigateTo(RouteKey.TicketCreate, [], {
        queryParams: {
          serviceId: resource.serviceId
        }
      });
  }

  public getTagsList(tags: McsAzureResourceTag[]): string {
    let unresolvedTags: boolean = tags === undefined || tags === null;
    if (unresolvedTags) {
      return 'Retrieving tags...';
    }

    if (isNullOrEmpty(tags)) {
      return 'No tags found.';
    }

    let tagsList: string = '';
    tags.forEach((tag: McsAzureResourceTag) => {
      if (tagsList) { tagsList = tagsList + ', '; }

      tagsList = tagsList + `${tag.name}: ${tag.value}`;
    });

    return tagsList;
  }

  public getTags(resource: McsAzureResource): void {
    if (resource.tags !== undefined) { return; }
    resource.tags = null;
    this._changeDetectorRef.markForCheck();

    this._apiService.getAzureResource(resource.id)
      .pipe(
        catchError((error) => {
          resource.tags = undefined;
          this._changeDetectorRef.markForCheck();
          return throwError('Failed retrieving resource tags');
        })
      )
      .subscribe((response) => {
        this._changeDetectorRef.markForCheck();
      });
  }

  public onEnterKeyUpEvent(searchTagName: string, searchTagValue: string): void {
    let noChange: boolean = searchTagName === this.tagName && searchTagValue === this.tagValue;
    if (noChange) { return; }

    this.tagName = searchTagName;
    this.tagValue = searchTagValue;
    this.retryDatasource();
  }

  private _getAzureResources(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsAzureResource>> {
    let queryParam = new McsAzureResourceQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.tagName = this.tagName;
    queryParam.tagValue = this.tagValue;
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getAzureResources(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }
}
