import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  SimpleChanges
} from '@angular/core';
import { Router } from '@angular/router';
import {
  McsFileInfo,
  McsTextContentProvider,
  CoreRoutes,
  McsRouteKey
} from '../../../../core';
import { isNullOrEmpty } from '../../../../utilities';
import {
  Product,
  ProductDownload,
  ProductDependency
} from '../../models';

@Component({
  selector: 'mcs-product-annex',
  templateUrl: 'product-annex.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'product-annex-wrapper block'
  }
})

export class ProductAnnexComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  public product: Product;

  public textContent: any;

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.products.product;
  }

  public ngOnChanges(changes: SimpleChanges) {
    let productChanges = changes['product'];
    if (!isNullOrEmpty(productChanges)) {
      this._changeDetectorRef.markForCheck();
    }
  }

  public ngOnDestroy() {
    // Do something
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
}
