import { Injectable } from '@angular/core';
import {
  Observable,
  of,
  BehaviorSubject
} from 'rxjs';
import {
  map,
  switchMap,
  tap
} from 'rxjs/operators';
import {
  McsApiCollection,
  McsOrderAvailableFamily,
  McsOrderAvailableGroup,
  McsQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  getSafeProperty,
  createObject,
  isNullOrEmpty
} from '@app/utilities';

@Injectable()
export class OrdersDashboardService {
  private _orderFamilies: McsApiCollection<McsOrderAvailableFamily>;
  private _selectedOrderGroupChange = new BehaviorSubject<McsOrderAvailableGroup>(null);

  constructor(private _apiService: McsApiService) { }

  public getSelectedOrderGroup(): McsOrderAvailableGroup {
    return this._selectedOrderGroupChange.getValue();
  }

  public setSelectedOrderGroup(orderGroup: McsOrderAvailableGroup): void {
    this._selectedOrderGroupChange.next(orderGroup);
  }

  public getOrderAvailableFamilies(query?: McsQueryParam): Observable<McsApiCollection<McsOrderAvailableFamily>> {
    return isNullOrEmpty(this._orderFamilies) ?
      this._getOrderFamiliesApi() :
      this._getOrderFamiliesCache(query);
  }

  public getOrderAvailableGroup(groupId: string): Observable<McsOrderAvailableGroup> {
    return this.getOrderAvailableFamilies().pipe(
      switchMap((families) => {
        let orderFamilies = getSafeProperty(families, (obj) => obj.collection, []);
        let orderGroup: McsOrderAvailableGroup;

        orderFamilies.forEach((family) => {
          if (!isNullOrEmpty(orderGroup)) { return; }
          orderGroup = family.groups.find((group) => group.id === groupId);
        });
        return of(orderGroup);
      })
    );
  }

  private _getOrderFamiliesApi(): Observable<McsApiCollection<McsOrderAvailableFamily>> {
    return this._apiService.getOrderAvailableItemTypes().pipe(
      map((available) => {
        let availableCollection = getSafeProperty(available, (obj) => obj.collection);
        let families: McsOrderAvailableFamily[] = [];

        availableCollection.forEach((collection) => {
          collection.platforms.forEach((platform) => {
            families.push(...platform.families);
          });
        });

        return createObject<McsApiCollection<any>, any>(McsApiCollection, {
          collection: families,
          totalCollectionCount: families.length
        });
      }),
      tap((orderFamilies) => this._orderFamilies = orderFamilies)
    );
  }

  private _getOrderFamiliesCache(query: McsQueryParam): Observable<McsApiCollection<McsOrderAvailableFamily>> {
    let familiesCollection = getSafeProperty(this._orderFamilies, (obj) => obj.collection, []);
    let filteredFamilies = familiesCollection.filter(
      (family) => family.name.toLocaleLowerCase().includes(query.keyword)
    );

    return of(
      createObject<McsApiCollection<any>, any>(McsApiCollection, {
        collection: filteredFamilies,
        totalCollectionCount: filteredFamilies.length
      })
    );
  }
}
