import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
/** Providers / Services */
import {
  CoreDefinition,
  McsTextContentProvider,
  McsAccessControlService
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

  public get arrowUpIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _accessControlService: McsAccessControlService,
    private _productCatalogRepository: ProductCatalogRepository
  ) {
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.navigation;
    this._getProductCatalogs();
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
   * Returns the macquarie view url
   */
  public get macquarieViewUrl(): string {
    return resolveEnvVar('MACQUARIE_VIEW_URL');
  }

  /**
   * Returns true when feature flag is on for product catalog
   */
  public get productCatalogFeatureIsOn(): boolean {
    return this._accessControlService.hasAccessToFeature('enableProductCatalog');
  }

  /**
   * Gets the product catalogs
   */
  private _getProductCatalogs(): void {
    this._productCatalogRepository.findAllRecords()
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.productCatalogs = response;
      });
  }
}
