import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  OnDestroy
} from '@angular/core';

import {
  McsAccessControlService,
  McsMatTableContext,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsStorageSaasBackupBackupAttemptDetails,
  McsStorageSaasBackupUsers
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  CommonDefinition,
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

import { SaasUsersConfig } from '../saas-backup-management.component';

@Component({
  selector: 'mcs-saas-backup-users',
  templateUrl: './saas-backup-users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class SaasBackupUsersComponent implements OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsStorageSaasBackupUsers>;
  public readonly defaultColumnFilters2: McsFilterInfo[];

  private _config: SaasUsersConfig;

  @Input()
  public set config(value: SaasUsersConfig) {
    if (isNullOrEmpty(value)) { return; }
    this._config = value;

    this.dataSource.updateDatasource(this._getSaasBackupUsers.bind(this));
  }
  public get config() {
    return this._config;
  }

  constructor(
    _injector: Injector,
    private _apiService: McsApiService
  ) {
    this.dataSource = new McsTableDataSource2();
    this.defaultColumnFilters2 = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'user' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' })
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters2);
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public ngOnDestroy() {
    this.dataSource.disconnect(null);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _getSaasBackupUsers(): Observable<McsMatTableContext<McsStorageSaasBackupUsers>> {
    return this._apiService.getSaasBackupBackupAttemptDetails(
      this._config.selectedSaasBackupId, this._config.selectedBackupAttemptId).pipe(
      map((response: McsStorageSaasBackupBackupAttemptDetails) => {
        let saasBackupUsers = getSafeProperty(response, obj => obj.users);
        return new McsMatTableContext(saasBackupUsers, saasBackupUsers?.length)
      })
    )
  }
}