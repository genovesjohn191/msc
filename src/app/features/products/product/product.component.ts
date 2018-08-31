import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Subscription,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsFileInfo,
  CoreRoutes,
  McsRouteKey
} from '../../../core';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '../../../utilities';
import {
  Product,
  ProductDownload,
  ProductDependency
} from '../models';
import { ProductService } from './product.service';

@Component({
  selector: 'mcs-product',
  templateUrl: 'product.component.html',
  styleUrls: ['./product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    'class': 'product-wrapper'
  }
})

export class ProductComponent implements OnInit, OnDestroy {

  public textContent: any;
  public productSubscription: Subscription;
  private _destroySubject = new Subject<void>();

  /**
   * Returns the selected product from the list panel
   */
  public get selectedProduct(): Product {
    return this._productService.selectedProduct;
  }

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _productService: ProductService
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.products.product;
    this._listenToSelectedProduct();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns the configuration file for download component
   * @param download Product download details
   */
  public getFileInfo(download: ProductDownload): McsFileInfo {
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
  public onClickDependency(dependency: ProductDependency): void {
    if (isNullOrEmpty(dependency)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(McsRouteKey.ProductDetail), dependency.id]);
  }

  /**
   * Listens to every product selection and refresh the dom
   */
  private _listenToSelectedProduct(): void {
    this._productService.productSelectionChange
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
