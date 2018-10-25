import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  McsTextContentProvider,
  CoreRoutes,
  CoreDefinition
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  RouteKey,
  McsFileInfo,
  McsProduct,
  McsProductDownload,
  McsProductDependency
} from '@app/models';
import { ProductService } from './product.service';

@Component({
  selector: 'mcs-product',
  templateUrl: 'product.component.html',
  styleUrls: ['./product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'product-wrapper'
  }
})

export class ProductComponent implements OnInit {
  public textContent: any;
  public selectedProduct$: Observable<McsProduct>;

  public get productCatalogBannerKey(): string {
    return CoreDefinition.ASSETS_IMAGE_PRODUCT_CATALOG_BANNER;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _productService: ProductService
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.products.product;
    this._subscribeToSelectedProduct();
  }

  /**
   * Returns the configuration file for download component
   * @param download Product download details
   */
  public getFileInfo(download: McsProductDownload): McsFileInfo {
    if (isNullOrEmpty(download)) { return undefined; }
    return {
      filename: download.name,
      fileContents: {
        name: download.name,
        type: download.fileType,
        size: download.fileSizeInKB
      }
    } as McsFileInfo;
  }

  /**
   * Event that emits when dependency is clicked
   */
  public onClickDependency(dependency: McsProductDependency): void {
    if (isNullOrEmpty(dependency)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.ProductDetail), dependency.id]);
  }

  /**
   * Listens to every product selection and refresh the dom
   */
  private _subscribeToSelectedProduct(): void {
    this.selectedProduct$ = this._productService.productSelectionChange;
  }
}
