import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsQueryParam,
  McsTerraformDeployment,
  McsTerraformDeploymentActivity
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-azure-deployment-activities',
  templateUrl: './azure-deployment-activities.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentActivitiesComponent implements OnDestroy {
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

  @Input()
  public get deployment(): McsTerraformDeployment {
    return this._deployment;
  }
  public set deployment(val: McsTerraformDeployment) {
    if (isNullOrEmpty(val)) { return; }
    this._deployment = val;
    this.dataSource = new McsTableDataSource2(this._getDeploymentActivities.bind(this));
  }

  public activity: McsTerraformDeploymentActivity;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'id' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'createdOn' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'updatedOn' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'type' }),

  ];
  public dataSource: McsTableDataSource2<McsTerraformDeploymentActivity>;

  private _deployment: McsTerraformDeployment;
  private _data: McsTerraformDeploymentActivity[] = [];

  public constructor(private _apiService: McsApiService, private _translateService: TranslateService) {}

  public ngOnDestroy() {
    this.dataSource.disconnect(null);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public showActivityDetails(activity: McsTerraformDeploymentActivity): void {
    this.activity = activity;
  }

  public backToListing(): void {
    this.activity = null;
  }

  private _getDeploymentActivities(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsTerraformDeploymentActivity>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = '';

    return this._apiService.getTerraformDeploymentActivities(this.deployment.id, queryParam).pipe(
      map((response) => {
        this._data = this._data.concat(response?.collection);
        return new McsMatTableContext(this._data, response?.totalCollectionCount);
      }));
  }
}