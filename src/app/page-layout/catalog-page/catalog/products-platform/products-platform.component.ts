import {
  combineLatest,
  of,
  Observable
} from 'rxjs';
import {
  map,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  McsErrorHandlerService,
  McsNavigationService
} from '@app/core';
import {
  CatalogViewType,
  HttpStatusCode,
  McsCatalogProduct,
  McsCatalogProductFamily,
  McsCatalogProductPlatform,
  RouteKey
} from '@app/models';
import { Search } from '@app/shared';
import {
  containsString,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility
} from '@app/utilities';

import { CatalogService } from '../catalog.service';
import {
  CatalogHeader,
  CatalogItemDetails,
  CatalogType
} from '../shared';

@Component({
  selector: 'mcs-catalog-products-platform',
  templateUrl: './products-platform.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsPlatformComponent implements OnInit {
  public treeDatasource = new TreeDatasource<McsCatalogProductFamily>(null);

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _catalogService: CatalogService,
    private _navigationService: McsNavigationService,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  public ngOnInit(): void {
    this._subscribetoPlatformDetails();
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public onProductChange(id: string): void {
    if (isNullOrEmpty(id)) { return; }
    this._navigationService.navigateTo(RouteKey.CatalogProduct, [id]);
  }

  private _subscribetoPlatformDetails(): void {
    combineLatest([
      this._activatedRoute.data,
      this._catalogService.useCaseSearchRefChange()
    ]).pipe(
      map(([resolver, useCaseFilter]) => {
        let platformDetails = getSafeProperty(resolver, (obj) => obj.platform) as McsCatalogProductPlatform;
        this._updatePlatformDetails(platformDetails, useCaseFilter);
        return platformDetails;
      }),
      tap(platform => {
        if (isNullOrEmpty(platform)) { this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound); }
        let catalogItemDetails = new CatalogItemDetails();
        catalogItemDetails.id = platform.id;
        catalogItemDetails.catalogViewType = CatalogViewType.ProductPlatform;
        catalogItemDetails.catalogType = CatalogType.Products;
        catalogItemDetails.platformType = platform.name;
        catalogItemDetails.header = createObject(CatalogHeader, {
          title: platform.name
        });

        this._catalogService.updateActiveCatalogItemDetails(catalogItemDetails);
        this._catalogService.updateCatalogItemMenuByType(CatalogType.Products, false);
      })
    ).subscribe();
  }

  private _updatePlatformDetails(
    details: McsCatalogProductPlatform,
    search: Search
  ): void {
    this.treeDatasource.updateDatasource(this._convertFamiliesToTreeItems.bind(this, details));
    this.treeDatasource
      .registerSearch(search)
      .registerSearchPredicate(this._useCaseFilterPredicate.bind(this));
  }

  private _convertFamiliesToTreeItems(details: McsCatalogProductPlatform): Observable<TreeItem<any>[]> {
    return of(TreeUtility.convertEntityToTreemItems(
      details?.families,
      entity => new TreeGroup(entity.name, entity.id, entity.groups),
      group => new TreeGroup(group.name, group.id, group.products),
      product => new TreeGroup(product.name)
    ));
  }

  private _useCaseFilterPredicate(
    product: McsCatalogProduct,
    keyword: string
  ): boolean {
    if (isNullOrEmpty(keyword)) { return true; }
    // We want to skip those are not product in the searching
    if (!(product instanceof McsCatalogProduct)) { return false; }

    let useCases = product.useCases || [];
    let useCaseFound = useCases.find(useCase => {
      if (typeof useCase === 'string') {
        return containsString(useCase, keyword);
      }

      return containsString(useCase.name, keyword) ||
        containsString(useCase.description, keyword);
    });
    return !isNullOrEmpty(useCaseFound);
  }
}
