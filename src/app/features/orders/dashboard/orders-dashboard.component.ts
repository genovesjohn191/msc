import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  map,
  shareReplay,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  McsListviewContext,
  McsListviewDataSource2,
  McsListviewQueryParam,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsOrderAvailableFamily,
  McsOrderAvailableGroup,
  McsQueryParam,
  RouteKey
} from '@app/models';
import { Search } from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { OrdersDashboardService } from './orders-dashboard.service';

@Component({
  selector: 'mcs-orders-dashboard',
  templateUrl: './orders-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersDashboardComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsOrderAvailableFamily>;
  public readonly dataEvents: McsTableEvents<McsOrderAvailableFamily>;

  public orderGroup$: Observable<McsOrderAvailableGroup>;
  private _orderGroupChange = new BehaviorSubject<McsOrderAvailableGroup>(null);

  constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _ordersDashboardService: OrdersDashboardService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getOrderFamilies.bind(this),
      {
        panelSettings: {
          inProgressText: _translate.instant('orderDashboard.loading'),
          emptyText: _translate.instant('orderDashboard.noOrdersAvailable'),
          errorText: _translate.instant('orderDashboard.errorMessage')
        }
      }
    );
    this.dataEvents = new McsTableEvents(_injector, this.listviewDatasource, {
      dataChangeEvent: McsEvent.dataChangeOrders as any
    });
  }

  public ngOnInit() {
    this._subscribeToOrderGroup();
  }

  public ngOnDestroy() {
    this.listviewDatasource.disconnect(null);
    this.dataEvents.dispose();
    unsubscribeSafely(this._orderGroupChange);
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.listviewDatasource.registerSearch(value);
    }
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public onClickOrderGroup(group: McsOrderAvailableGroup): void {
    this._orderGroupChange.next(group);
  }

  private _getOrderFamilies(param: McsListviewQueryParam): Observable<McsListviewContext<McsOrderAvailableFamily>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._ordersDashboardService.getOrderAvailableFamilies(queryParam).pipe(
      tap((familyCollection) => {
        let families = getSafeProperty(familyCollection, (obj) => obj.collection, []);
        let familyWithGroup = families.find((family: McsOrderAvailableFamily) => {
          return !isNullOrEmpty(family.groups) &&
            !isNullOrEmpty(family.groups.find((group) => !isNullOrEmpty(group.orderAvailableItemTypes)));
        });

        if (isNullOrEmpty(familyWithGroup)) {
          this._orderGroupChange.next(new McsOrderAvailableGroup());
          return;
        }
        this._orderGroupChange.next(familyWithGroup.groups
          .find((group) => !isNullOrEmpty(group.orderAvailableItemTypes))
        );
      }),
      map(familyCollection => {
        return new McsListviewContext<McsOrderAvailableFamily>(
          familyCollection?.collection,
          familyCollection?.totalCollectionCount
        );
      })
    );
  }

  private _subscribeToOrderGroup(): void {
    this.orderGroup$ = this._orderGroupChange.asObservable().pipe(
      shareReplay(1)
    );
  }
}
