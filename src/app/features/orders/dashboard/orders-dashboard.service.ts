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
  McsQueryParam,
  McsOrderAvailablePlatform,
  OrderAvailablePlatformType
} from '@app/models';
import { McsAuthenticationIdentity } from '@app/core';
import { McsApiService } from '@app/services';
import {
  getSafeProperty,
  createObject,
  isNullOrEmpty
} from '@app/utilities';

@Injectable()
export class OrdersDashboardService {
  private _orderPlatforms: McsApiCollection<McsOrderAvailablePlatform>;
  private _selectedOrderGroupChange = new BehaviorSubject<McsOrderAvailableGroup>(null);

  constructor(
    private _apiService: McsApiService,
    private _identity: McsAuthenticationIdentity
  ) { }

  public getSelectedOrderGroup(): McsOrderAvailableGroup {
    return this._selectedOrderGroupChange.getValue();
  }

  public setSelectedOrderGroup(orderGroup: McsOrderAvailableGroup): void {
    this._selectedOrderGroupChange.next(orderGroup);
  }

  public getOrderAvailableGroup(groupId: string): Observable<McsOrderAvailableGroup> {
    return this.getOrderAvailableFamilies().pipe(
      switchMap((availableFamilies) => {
        let orderGroup: McsOrderAvailableGroup;
        let families = getSafeProperty(availableFamilies, (obj) => obj.collection);

        families.forEach((family) => {
          if (!isNullOrEmpty(orderGroup)) { return; }
          orderGroup = family.groups.find((group) => group.id === groupId);
        });
        return of(orderGroup);
      })
    );
  }

  public getOrderAvailableFamilies(query?: McsQueryParam): Observable<McsApiCollection<McsOrderAvailableFamily>> {
    let orderFamilies = isNullOrEmpty(this._orderPlatforms) ? this._getOrderFamiliesFromPlatformApi() :
      of(this._orderPlatforms).pipe(
        map((platforms) => this._filterByOrderFamily(platforms.collection, query))
      );

    return orderFamilies.pipe(
      map((families) => {
        return createObject<McsApiCollection<any>, any>(McsApiCollection, {
          collection: families,
          totalCollectionCount: families.length
        });
      })
    );
  }

  public getOrderAvailablePlatforms(query?: McsQueryParam): Observable<McsApiCollection<McsOrderAvailablePlatform>> {
    return isNullOrEmpty(this._orderPlatforms) ?
      this._getOrderPlatformsApi() :
      this._getOrderPlatformsCache(query);
  }

  private _getOrderFamiliesFromPlatformApi(): Observable<McsOrderAvailableFamily[]> {
    return this.getOrderAvailablePlatforms().pipe(
      map((available) => {
        let availablePlatforms = getSafeProperty(available, (obj) => obj.collection);
        let families: McsOrderAvailableFamily[] = [];

        availablePlatforms.forEach((platform) => {
          families.push(...platform.families);
        });

        return families;
      })
    );
  }

  private _filterByOrderFamily(platforms: McsOrderAvailablePlatform[], query: McsQueryParam): McsOrderAvailableFamily[] {
    let filteredFamilies: McsOrderAvailableFamily[] = [];
    platforms.forEach((platform) => {
      platform.families.forEach((family) => {
        if (family.name.toLocaleLowerCase().includes(query.keyword)) {
          filteredFamilies.push(family);
        }
      });
    });
    return filteredFamilies;
  }

  private _getOrderPlatformsApi(): Observable<McsApiCollection<McsOrderAvailablePlatform>> {
    return this._apiService.getOrderAvailableItemTypes().pipe(
      map((availableOrdersCollection) => {
        let availableOrders = getSafeProperty(availableOrdersCollection, (obj) => obj.collection);
        let platforms: McsOrderAvailablePlatform[] = [];

        availableOrders.forEach((collection) => {
          let filteredPlatforms = collection.platforms.filter((platform) => {
            let isPlatformPublicCloud = platform.type === OrderAvailablePlatformType.PublicCloud;
            let hasPublicCloudPlatformAndAccess = isPlatformPublicCloud && this._identity.platformSettings.hasPublicCloud;
            let hasPrivateCloudPlatformAndAccess = !isPlatformPublicCloud && this._identity.platformSettings.hasPrivateCloud;

            return hasPublicCloudPlatformAndAccess || hasPrivateCloudPlatformAndAccess;
          });
          if (isNullOrEmpty(filteredPlatforms)) { return; }
          platforms.push(...filteredPlatforms);
        });

        return createObject<McsApiCollection<any>, any>(McsApiCollection, {
          collection: platforms,
          totalCollectionCount: platforms.length
        });
      }),
      tap((orderPlatforms) => this._orderPlatforms = orderPlatforms)
    );
  }

  private _getOrderPlatformsCache(query: McsQueryParam): Observable<McsApiCollection<McsOrderAvailablePlatform>> {
    let platformsCollection = getSafeProperty(this._orderPlatforms, (obj) => obj.collection, []);
    let filteredPlatforms = platformsCollection.filter(
      (platform) => platform.name.toLocaleLowerCase().includes(query.keyword)
    );

    return of(
      createObject<McsApiCollection<any>, any>(McsApiCollection, {
        collection: platformsCollection,
        totalCollectionCount: filteredPlatforms.length
      })
    );
  }
}
