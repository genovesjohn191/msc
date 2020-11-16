import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import { Injectable } from '@angular/core';
import { McsOption } from '@app/models';
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
