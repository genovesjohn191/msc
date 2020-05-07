import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  map,
  shareReplay,
  tap
} from 'rxjs/operators';
import { McsNavigationService } from '@app/core';
import {
  RouteKey,
  McsCatalogProductPlatform,
  CatalogViewType
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty,
  createObject
} from '@app/utilities';
import { CatalogService } from '../catalog.service';
import {
  CatalogItemDetails,
  CatalogHeader,
  CatalogType
} from '../shared';

@Component({
  selector: 'mcs-catalog-products-platform',
  templateUrl: './products-platform.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsPlatformComponent implements OnInit {

  public platform$: Observable<McsCatalogProductPlatform>;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _catalogService: CatalogService,
    private _navigationService: McsNavigationService
  ) { }

  public ngOnInit(): void {
    this._subscribeToPlatformResolver();
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public onProductChange(id: string): void {
    if (isNullOrEmpty(id)) { return; }
    this._navigationService.navigateTo(RouteKey.CatalogProduct, [id]);
  }

  private _subscribeToPlatformResolver(): void {
    this.platform$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.platform)),
      tap((platform) => {
        if (isNullOrEmpty(platform)) { return; }
        this._catalogService.updateActiveCatalogItemDetails(createObject(CatalogItemDetails, {
          id: platform.id,
          catalogViewType: CatalogViewType.ProductPlatform,
          catalogType: CatalogType.Products,
          platformType: platform.name,
          header: createObject(CatalogHeader, {
            title: platform.name
          })
        }));
        this._catalogService.updateCatalogItemMenuByType(CatalogType.Products, false);
      }),
      shareReplay(1)
    );
  }
}
