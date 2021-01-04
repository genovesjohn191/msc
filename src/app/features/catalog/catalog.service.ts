import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import { Injectable } from '@angular/core';
import { McsOption } from '@app/models';
import { Search } from '@app/shared';
import {
  createObject,
  isNullOrEmpty
} from '@app/utilities';

import {
  CatalogItem,
  CatalogItemDetails,
  CatalogItemMenu,
  CatalogType
} from './shared';

@Injectable()
export class CatalogService {

  private _catalogItemMenuChange = new BehaviorSubject<CatalogItemMenu>(null);
  private _activeCatalogItemDetailsChange = new BehaviorSubject<CatalogItemDetails>(null);
  private _catalogOptionsCached = new Array<McsOption>();
  private _useCaseSearchRefChange = new BehaviorSubject<Search>(null);

  public get activeCatalogItemDetailsChange(): Observable<CatalogItemDetails> {
    return this._activeCatalogItemDetailsChange.asObservable();
  }

  public get catalogItemMenuChange(): Observable<CatalogItemMenu> {
    return this._catalogItemMenuChange.asObservable();
  }

  public get catalogOptionsCached(): Array<McsOption> {
    return this._catalogOptionsCached;
  }

  public set catalogOptionsCached(options: Array<McsOption>) {
    this._catalogOptionsCached = options;
  }

  public useCaseSearchRefChange(): Observable<Search> {
    return this._useCaseSearchRefChange.asObservable();
  }

  public updateUseCaseSeachRef(useCaseSearchRef: Search): void {
    this._useCaseSearchRefChange.next(useCaseSearchRef);
  }

  public updateActiveCatalogItemDetails(details: CatalogItemDetails): void {
    if (isNullOrEmpty(details)) { return; }
    this._activeCatalogItemDetailsChange.next(details);
  }

  public updateCatalogItemMenuByType(type: CatalogType, showMenu: boolean): void {
    if (isNullOrEmpty(type)) { return; }
    let catalogItem = this._getCachedCatalogItem(type);
    this._catalogItemMenuChange.next(createObject(CatalogItemMenu, { catalogItem, showMenu }));
  }

  private _getCachedCatalogItem(type: CatalogType): CatalogItem<any> {
    return this.catalogOptionsCached.map((options) => options.value).find((item) => item.type === type);
  }
}
