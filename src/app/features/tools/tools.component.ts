import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit
} from '@angular/core';
import {
  CoreConfig,
  McsFilterService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import {
  McsPortal,
  McsPortalAccess,
  McsQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  cloneObject,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-tools',
  templateUrl: './tools.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ToolsComponent implements OnInit {
  public readonly toolDescriptionMap: Map<string, string>;
  public readonly dataSource: McsTableDataSource2<McsPortal>;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _coreConfig: CoreConfig,
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _filterService: McsFilterService
  ) {
    this.toolDescriptionMap = new Map<string, string>();
    this.dataSource = new McsTableDataSource2(this._getPortals.bind(this));
    this._initializeToolDescriptionMap()
  }

  public ngOnInit(): void {
    this._initializeDataColumns();
  }

  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_TOOLS_LISTING;
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _initializeToolDescriptionMap(): void {
    let descriptions = this._translateService.instant('tools.table.descriptions');
    this.toolDescriptionMap.set(descriptions.macquarieView.name, descriptions.macquarieView.description);
    this.toolDescriptionMap.set(descriptions.vCloud.name, descriptions.vCloud.description);
    this.toolDescriptionMap.set(descriptions.vSphere.name, descriptions.vSphere.description);
    this.toolDescriptionMap.set(descriptions.firewall.name, descriptions.firewall.description);
  }

  private _getPortals(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsPortal>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getPortals(queryParam).pipe(
      map((response) => {
        let macquarieTools: McsPortal[] = [];

        // Add Macquarie View
        let macquarieView = new McsPortal();
        macquarieView.name = 'Macquarie View';
        macquarieView.resourceSpecific = true;

        let macquarieViewPortalAccess = new McsPortalAccess();
        macquarieViewPortalAccess.name = macquarieView.name;
        macquarieViewPortalAccess.url = this._coreConfig.macviewUrl;
        macquarieView.portalAccess = Array(macquarieViewPortalAccess);
        macquarieTools.push(macquarieView, ...cloneObject(response.collection));

        let dataItems = macquarieTools.filter((tool) => tool.resourceSpecific);
        let dataSourceContext = new McsMatTableContext(dataItems, dataItems.length);
        return dataSourceContext;
      })
    );
  }

  private _initializeDataColumns(): void {
    let dataColumns = this._filterService.getFilterSettings(
      CommonDefinition.FILTERSELECTOR_TOOLS_LISTING);
    this.dataSource.registerColumnsFilterInfo(dataColumns);
  }
}
