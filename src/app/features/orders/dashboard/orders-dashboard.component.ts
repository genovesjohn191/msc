import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Injector,
  ChangeDetectorRef
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs';
import {
  tap,
  shareReplay
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { McsListViewListingBase } from '@app/core';
import {
  McsOrderAvailableGroup,
  McsQueryParam,
  McsApiCollection,
  McsOrderAvailableFamily,
  RouteKey
} from '@app/models';
import { McsEvent } from '@app/events';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { OrdersDashboardService } from './orders-dashboard.service';

@Component({
  selector: 'mcs-orders-dashboard',
  templateUrl: './orders-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrdersDashboardComponent extends McsListViewListingBase<McsOrderAvailableFamily>
  implements OnInit, OnDestroy {

  public orderGroup$: Observable<McsOrderAvailableGroup>;

  private _destroySubject = new Subject<void>();
  private _orderGroupChange = new Subject<McsOrderAvailableGroup>();
  private _orderAvailableFamilies = new Subject<McsOrderAvailableFamily[]>();

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    _translate: TranslateService,
    private _ordersDashboardService: OrdersDashboardService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeOrders,
      panelSettings: {
        inProgressText: _translate.instant('orderDashboard.loading'),
        emptyText: _translate.instant('orderDashboard.noOrdersAvailable'),
        errorText: _translate.instant('orderDashboard.errorMessage')
      }
    });
  }

  public ngOnInit() {
    this._subscribeToOrderGroup();
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._orderGroupChange);
    unsubscribeSafely(this._orderAvailableFamilies);
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public onClickOrderGroup(group: McsOrderAvailableGroup): void {
    this._orderGroupChange.next(group);
  }

  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsOrderAvailableFamily>> {
    return this._ordersDashboardService.getOrderAvailableFamilies(query).pipe(
      tap((familyCollection) => {
        let families = getSafeProperty(familyCollection, (obj) => obj.collection, []);
        let familyWithGroup = families.find((family) => !isNullOrEmpty(family.groups));
        if (isNullOrEmpty(familyWithGroup)) { return; }

        // Select intialy when obtained
        this._orderGroupChange.next(familyWithGroup.groups[0]);
      })
    );
  }

  private _subscribeToOrderGroup(): void {
    this.orderGroup$ = this._orderGroupChange.asObservable().pipe(
      shareReplay(1)
    );
  }
}
