import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import {
  McsAccessControlService,
  McsAuthenticationIdentity,
  McsPageBase
} from '@app/core';
import {
  McsCompany,
  McsFeatureFlag,
  McsFilterInfo,
  RouteKey
} from '@app/models';
import {
  ColumnFilter,
  Search
} from '@app/shared';
import {
  createObject,
  isNullOrEmpty,
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from './notifications.component.service';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsComponent extends McsPageBase {
  public readonly activitiesFilterPredicate = this._activitiesIsColumnIncluded.bind(this);
  public readonly defaultActivitiesColumnFilters = [
    createObject(McsFilterInfo, { value: false, exclude: false, id: 'id' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'notification' }),
    createObject(McsFilterInfo, { value: false, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'targetCompany' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'user' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'startTime' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'completed' })
  ];

  public readonly noticesFilterPredicate = this._noticesIsColumnIncluded.bind(this);
  public readonly defaultNoticesColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'parentReferenceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'referenceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'summary' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdOn' })
  ];

  public activitiesTableFilters: ColumnFilter;
  public noticesTableFilters: ColumnFilter;
  public defaultColumnFilters: McsFilterInfo[] = this.defaultActivitiesColumnFilters;

  public selectedTabIndex: number = 0;
  public filterFeatureName: string = this.activitiesFeatureName;
  public isSorting: boolean;
  public keyword: Search;

  private _search: Search;

  public constructor(
    _injector: Injector,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _accessControlService: McsAccessControlService,
    private _notificationService: NotificationsService,
    private _translate: TranslateService
  ) {
    super(_injector);
  }

  @ViewChild('activitiesColumnFilter')
  public set activitiesColumnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value) && isNullOrEmpty(this.activitiesTableFilters)) {
      this.activitiesTableFilters = value;
    }
  }

  @ViewChild('noticesColumnFilter')
public set noticesColumnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value) && isNullOrEmpty(this.noticesTableFilters)) {
      this.noticesTableFilters = value;
    }
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (this._search !== value) {
      this._search = value;
      this.keyword = value;
      this.changeDetector.markForCheck();
    }
  }

  public onChangeSearch(search: Search): void {
    this.keyword = search;
    this.changeDetector.markForCheck();
  }

  public get featureName(): string {
    return this._setFeatureName();
  }

  public get noticesFeatureName(): string {
    return 'notices';
  }

  public get activitiesFeatureName(): string {
    return 'activities';
  }

  public get activitiesTabLabel(): string {
    return this._translate.instant('label.activity');
  }

  public get noticesTabLabel(): string {
    return this._translate.instant('label.notices');
  }

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  public get hasAccessToNotices(): boolean {
    return this._accessControlService.hasAccessToFeature(McsFeatureFlag.NoticesListing);
  }

  public get activitiesTotalCount(): number {
    return this._notificationService.getActivitiesTotalCount();
  }

  public get noticesTotalCount(): number {
    return this._notificationService.getNoticesTotalCount();
  }

  public isTableSorting(isSorting: boolean): void {
    this.isSorting = isSorting;
    this.changeDetector.markForCheck();
  }

  public onTabChanged(tab: any) {
    let path = tab.index === 0 ? this.activitiesFeatureName : this.noticesFeatureName;
    this.defaultColumnFilters = this._setDefaultColumnFilters();
    this.filterFeatureName = this._setFeatureName();

    this.changeDetector.markForCheck();
    this.navigation.navigateTo(RouteKey.Notifications, [path]);
  }

  private _setDefaultColumnFilters(): McsFilterInfo[] {
    if (this.selectedTabIndex === 0) {
      return this.defaultActivitiesColumnFilters;
    }
    return this.defaultNoticesColumnFilters;
  }

  private _setFeatureName(): string {
    if (this.selectedTabIndex === 0) {
      return this.activitiesFeatureName;
    }
    return this.noticesFeatureName;
  }

  private _activitiesIsColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id === 'serviceId') {
      return this._isInLPContext();
    }

    if (filter.id === 'targetCompany') {
      return this._isInLPContext();
    }
    return true;
  }

  private _noticesIsColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id === 'parentReferenceId') {
      return this._accessControlService.hasPermission(['NoticeInternalView']);
    }
    return true;
  }

  private _isInLPContext(): boolean {
    let _isImpersonating = !!this._authenticationIdentity.activeAccountStatus;
    if (this._accessControlService.hasPermission(['InternalEngineerAccess']) && !_isImpersonating) {
      return true;
    }
    return false;
  }
}
