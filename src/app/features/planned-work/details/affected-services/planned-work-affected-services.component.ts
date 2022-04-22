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
  McsPlannedWorkAffectedService
} from '@app/models';
import { ColumnFilter } from '@app/shared';
import {
  createObject,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

@Component({
  selector: 'mcs-planned-work-affected-services',
  templateUrl: './planned-work-affected-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannedWorkAffectedServicesComponent extends McsPageBase implements OnInit, OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsPlannedWorkAffectedService>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'billingDescription' })
  ];

  private _plannedWorkIdChange = new BehaviorSubject<string>(null);

  public constructor(
    injector: Injector
  ) {
    super(injector);
    this.dataSource = new McsTableDataSource2<McsPlannedWorkAffectedService>(this._getAffectedServices.bind(this))
      .registerConfiguration(new McsMatTableConfig(true))
      .registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public get featureName(): string {
    return 'planned-work-affected-services';
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public ngOnInit(): void {
    this._subscribeToPlannedWorkResolver();
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _subscribeToPlannedWorkResolver(): void {
    this.activatedRoute.parent.data.pipe(
      takeUntil(this.destroySubject),
      map(resolver => resolver?.plannedWork),
      tap(plannedWork => {
        this._plannedWorkIdChange.next(plannedWork?.id)
      })
    ).subscribe();
  }

  private _getAffectedServices(_param: McsMatTableQueryParam):
    Observable<McsMatTableContext<McsPlannedWorkAffectedService>> {
    return this._plannedWorkIdChange.pipe(
      filter(response => !isNullOrUndefined(response)),
      switchMap(id => {
        if (isNullOrEmpty(id)) { return of(null); }
        return this.apiService.getPlannedWorkAffectedServices(id).pipe(
          map(response => new McsMatTableContext<McsPlannedWorkAffectedService>(response?.collection))
        );
      })
    );
  }
}