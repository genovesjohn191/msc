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
  McsNetworkDbVlanEvent
} from '@app/models';
import { ColumnFilter } from '@app/shared';
import {
  createObject,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

@Component({
  selector: 'mcs-network-vlan-events',
  templateUrl: './vlan-events.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkVlanEventsComponent extends McsPageBase implements OnInit, OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsNetworkDbVlanEvent>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'user' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'networkName' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'networkServiceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'networkCompanyId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'date' })
  ];

  private _vlanIdChange = new BehaviorSubject<string>(null);

  public constructor(
    injector: Injector
  ) {
    super(injector);
    this.dataSource = new McsTableDataSource2<McsNetworkDbVlanEvent>(this._getVlanEvents.bind(this))
      .registerConfiguration(new McsMatTableConfig(true))
      .registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public get featureName(): string {
    return 'vlan-events';
  }

  public ngOnInit(): void {
    this._subscribeToVlanResolver();
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
  }

  private _subscribeToVlanResolver(): void {
    this.activatedRoute.parent.data.pipe(
      takeUntil(this.destroySubject),
      map(resolver => resolver?.vlan),
      tap(vlan => this._vlanIdChange.next(vlan?.id))
    ).subscribe();
  }

  private _getVlanEvents(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDbVlanEvent>> {
    return this._vlanIdChange.pipe(
      filter(response => !isNullOrUndefined(response)),
      switchMap(vlanId => {
        if (isNullOrEmpty(vlanId)) { return of(null); }

        return this.apiService.getNetworkDbVlanEvents(+vlanId).pipe(
          map(response => new McsMatTableContext<McsNetworkDbVlanEvent>(response?.collection))
        );
      })
    );
  }
}