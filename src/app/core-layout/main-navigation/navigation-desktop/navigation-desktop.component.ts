import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
/** Providers / Services */
import {
  CoreDefinition,
  McsTextContentProvider,
  McsDataStatusFactory
} from '../../../core';
import {
  resolveEnvVar,
  isNullOrEmpty
} from '../../../utilities';
import {
  Product,
  ProductCatalog,
  ProductCatalogRepository
} from '../../../features/products';

@Component({
  selector: 'mcs-navigation-desktop',
  templateUrl: './navigation-desktop.component.html',
  styleUrls: ['./navigation-desktop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class NavigationDesktopComponent implements OnInit {

  public textContent: any;
  public productCatalogs: ProductCatalog[];
  public productsStatusFactory: McsDataStatusFactory<ProductCatalog[]>;

  public get arrowUpIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _productCatalogRepository: ProductCatalogRepository
  ) {
    this.productsStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.navigation;
    this._getProductCatalogs();
  }

  /**
   * Returns the macquarie view url
   */
  public get macquarieViewUrl(): string {
    return resolveEnvVar('MACQUARIE_VIEW_URL');
  }

  /**
   * Returns true when feature flag is on for product catalog
   */
  public get productCatalogFeatureIsOn(): boolean {
    return this._productCatalogRepository.productCatalogFeatureIsOn;
  }

  /**
   * Navigate to product catalog
   * @param product Product to be navigated
   */
  public gotoProduct(_product: Product) {
    if (isNullOrEmpty(_product)) { return; }
    this._router.navigate(['/products/', _product.id]);
  }

  /**
   * Gets the product catalogs
   */
  private _getProductCatalogs(): void {
    this.productsStatusFactory.setInProgress();
    this._productCatalogRepository.findAllRecords()
      .pipe(
        catchError((error) => {
          this.productsStatusFactory.setError();
          return Observable.throw(error);
        })
      )
      .subscribe((response) => {
        this.productsStatusFactory.setSuccesfull(response);
        if (isNullOrEmpty(response)) { return; }
        this.productCatalogs = response;
      });
  }
}
