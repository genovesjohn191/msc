import {
  filter,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
  BehaviorSubject,
  Observable
} from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsPageBase,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsNoticeAssociatedService
} from '@app/models';
import { ColumnFilter } from '@app/shared';
import {
  createObject,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

@Component({
  selector: 'mcs-notice-associated-service',
  templateUrl: './notice-associated-service.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoticeAssociatedServiceComponent extends McsPageBase implements OnInit, OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsNoticeAssociatedService>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'billingDescription' })
  ];

  private _noticeIdChange = new BehaviorSubject<string>(null);

  public constructor(
    injector: Injector
  ) {
    super(injector);
    this.dataSource = new McsTableDataSource2<McsNoticeAssociatedService>(this._getAssociatedServices.bind(this))
      .registerConfiguration(new McsMatTableConfig(true))
      .registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public get featureName(): string {
    return 'notice-associated-services';
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public ngOnInit(): void {
    this._subscribeToNoticeResolver();
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _subscribeToNoticeResolver(): void {
    this.activatedRoute.parent.data.pipe(
      takeUntil(this.destroySubject),
      map(resolver => resolver?.notice),
      tap(notice => {
        this._noticeIdChange.next(notice?.id)
      })
    ).subscribe();
  }

  private _getAssociatedServices(_param: McsMatTableQueryParam):
    Observable<McsMatTableContext<McsNoticeAssociatedService>> {
    return this._noticeIdChange.pipe(
      filter(response => !isNullOrUndefined(response)),
      switchMap(id => {
        if (isNullOrEmpty(id)) { return of(null); }
        return this.apiService.getNoticeAssociatedServices(id).pipe(
          map(response => new McsMatTableContext<McsNoticeAssociatedService>(response?.collection))
        );
      })
    );
  }
}