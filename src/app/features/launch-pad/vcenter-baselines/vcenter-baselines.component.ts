import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsVCenterBaseline,
  McsVCenterBaselineQueryParam,
  RouteKey
} from '@app/models';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

@Component({
  selector: 'mcs-vcenter-baselines',
  templateUrl: './vcenter-baselines.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VCenterBaselinesComponent extends McsPageBase implements OnInit, OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsVCenterBaseline>;
  public readonly dataEvents: McsTableEvents<McsVCenterBaseline>;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'baseline' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'targetType' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'contentType' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'complianceSets' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'hosts' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'vCenter' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'approved' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedOn' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  public constructor(
    _injector: Injector
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getVCenterBaselines.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeVCenterBaselineEvent,
      dataClearEvent: McsEvent.dataClearVCenterBaseline
    });

    // TODO: Things to consider:
    // 1. Add the feature flag for: EnableVCenterBaselines, EnableRemediateESXiHosts

    // To be confirmed:
    // 1. Why the remediate request has only clusterid?
    // 2. From the baseline details, how to get the associated clusterId? to be passed on remediate
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
    return 'vcenter-baselines';
  }

  public ngOnInit(): void {

  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
    this.dataEvents.dispose();
  }

  public onClickRemediateEsxi(baseline?: McsVCenterBaseline): void {
    if (isNullOrUndefined(baseline)) {
      this.navigation.navigateTo(RouteKey.LaunchPadVCenterRemediateEsxiHosts);
      return;
    }

    this.navigation.navigateTo(RouteKey.LaunchPadVCenterRemediateEsxiHosts, null, {
      queryParams: {
        baselineId: baseline.id
      }
    });
  }

  public onNavigateToDetails(baseline: McsVCenterBaseline): void {
    // TODO: Add the page for the details
    // But we dont have the wireframe or specs for it :)
    // Wait Man
  }

  private _getVCenterBaselines(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsVCenterBaseline>> {
    let queryParam = new McsVCenterBaselineQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this.apiService.getVCenterBaselines(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount);
      })
    );
  }
}
