import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation,
  Injector
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subject,
  Observable,
} from 'rxjs';
import {
  switchMap,
  tap,
  shareReplay
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { McsListViewListingBase } from '@app/core';
import { unsubscribeSafely } from '@app/utilities';
import {
  RouteKey,
  McsProduct,
  McsProductCatalog,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import { ProductService } from './product/product.service';

@Component({
  selector: 'mcs-products',
  templateUrl: 'products.component.html',
  styleUrls: ['./products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'products-wrapper'
  }
})

export class ProductsComponent extends McsListViewListingBase<McsProductCatalog> implements OnInit, OnDestroy {
  public selectedProduct$: Observable<McsProduct>;
  private _destroySubject = new Subject<void>();

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _productService: ProductService,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeProducts,
      panelSettings: {
        inProgressText: _translate.instant('products.loading'),
        emptyText: _translate.instant('products.noProducts'),
        errorText: _translate.instant('products.errorMessage')
      }
    });
  }

  public ngOnInit() {
    this._subscribeToParamChange();
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this._destroySubject);
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Gets the entity listing from API
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsProductCatalog>> {
    return this._apiService.getProductCatalogs(query);
  }

  /**
   * Listens to every params changed and get the product by id
   */
  private _subscribeToParamChange(): void {
    this.selectedProduct$ = this._activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => this._apiService.getProduct(params.get('id'))),
      tap((response) => this._productService.setProduct(response)),
      shareReplay(1)
    );
  }
}
