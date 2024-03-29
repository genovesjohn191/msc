import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  CoreConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsPortal,
  McsPortalAccess,
  McsQueryParam,
  SortDirection
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  cloneObject,
  compareStrings,
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-tools',
  templateUrl: './tools.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ToolsComponent implements OnDestroy {
  public readonly toolDescriptionMap: Map<string, string>;
  public readonly dataSource: McsTableDataSource2<McsPortal>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'portal' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'access' })
  ];
  public overflowsShown = [];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _coreConfig: CoreConfig,
    private _translateService: TranslateService,
    private _apiService: McsApiService
  ) {
    this.toolDescriptionMap = new Map<string, string>();
    this._initializeToolDescriptionMap()

    this.dataSource = new McsTableDataSource2(this._getPortals.bind(this));
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public ngOnDestroy() {
    this.dataSource.disconnect(null);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public showOverflow(portal: string)  {
    this.overflowsShown.push(portal);
  }

  public overflowShown(portal: string)  {
    if (this.overflowsShown.includes(portal)) { return true; }
  }

  private _initializeToolDescriptionMap(): void {
    let descriptions = this._translateService.instant('tools.table.descriptions');
    this.toolDescriptionMap.set(descriptions.macquarieView.name, descriptions.macquarieView.description);
    this.toolDescriptionMap.set(descriptions.vCloud.name, descriptions.vCloud.description);
    this.toolDescriptionMap.set(descriptions.vSphere.name, descriptions.vSphere.description);
    this.toolDescriptionMap.set(descriptions.firewall.name, descriptions.firewall.description);
    this.toolDescriptionMap.set(descriptions.azurePortal.name, descriptions.azurePortal.description);
    this.toolDescriptionMap.set(descriptions.cloudHealth.name, descriptions.cloudHealth.description);
    this.toolDescriptionMap.set(descriptions.trendMicroDSM.name, descriptions.trendMicroDSM.description);
    this.toolDescriptionMap.set(descriptions.fortiAnalyzer.name, descriptions.fortiAnalyzer.description);
    this.toolDescriptionMap.set(descriptions.zerto.name, descriptions.zerto.description);
    this.toolDescriptionMap.set(descriptions.vMWarevRealizeOC.name, descriptions.vMWarevRealizeOC.description);
    this.toolDescriptionMap.set(descriptions.f5EnterpriseManager.name, descriptions.f5EnterpriseManager.description);
  }

  private _getPortals(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsPortal>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getPortals(queryParam).pipe(
      map((response) => {
        let macquarieTools: McsPortal[] = response.collection;
        let dataItems = this._filterValidDataItem(macquarieTools);
        let dataSourceContext = new McsMatTableContext(dataItems, dataItems.length);
        return dataSourceContext;
      })
    );
  }

  private _filterValidDataItem(macquarieTools: McsPortal[]): McsPortal[] {
    return macquarieTools.filter((tool: McsPortal) => {
      let portalAccess = getSafeProperty(tool, obj => obj.portalAccess);
      if (portalAccess.length === 0) { return; }
      let validPortalAccess = portalAccess.filter((access) => access.name || access.url);
      let validDataItem = validPortalAccess?.length > 0 && !isNullOrEmpty(tool.name);
      return validDataItem;
    })
  }
}
