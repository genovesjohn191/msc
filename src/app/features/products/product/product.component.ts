import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Renderer2,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  of
} from 'rxjs';
import {
  tap,
  switchMap
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  CoreRoutes,
  CoreDefinition
} from '@app/core';
import {
  isNullOrEmpty,
  animateFactory
} from '@app/utilities';
import {
  RouteKey,
  McsFileInfo,
  McsProduct,
  McsProductDownload,
  McsProductDependency
} from '@app/models';
import { ProductService } from './product.service';
import { ComponentHandlerDirective } from '@app/shared';

const MAX_CHAR_LENGTH = 200;

@Component({
  selector: 'mcs-product',
  templateUrl: 'product.component.html',
  styleUrls: ['./product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.fadeIn,
    animateFactory.fadeOut
  ],
  host: {
    'class': 'product-wrapper'
  }
})

export class ProductComponent implements OnInit {
  public textContent: any;
  public shortDescriptionExpanded: boolean;
  public showMoreButtonIsDisplayed: boolean;
  public selectedProduct$: Observable<McsProduct>;
  public selectedProductTextContent$: Observable<string>;

  // Table columns
  public thresholdColumns = ['description', 'alertThreshold'];
  public productOptionsColumns = ['name', 'properties', 'options'];
  public userCasesColumns = ['name', 'description'];

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  public get cloudIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOUD_BLUE;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  constructor(
    private _router: Router,
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _productService: ProductService
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.products.product;
    this._subscribeToSelectedProduct();
    this._subscribeToTextChange();
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
   * Toggles the short-description content
   */
  public toggleShortDescription(): void {
    this.shortDescriptionExpanded = !this.shortDescriptionExpanded;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listens to every product selection and refresh the dom
   */
  private _subscribeToSelectedProduct(): void {
    this.selectedProduct$ = this._productService.productSelectionChange.pipe(
      tap(() => {
        Promise.resolve().then(() => {
          if (isNullOrEmpty(this._componentHandler)) { return; }
          this._componentHandler.recreateComponent();
          this._changeDetectorRef.markForCheck();
        });
      })
    );
  }

  /**
   * Subscribe to short text change
   */
  private _subscribeToTextChange(): void {
    this.selectedProductTextContent$ = this._productService.productSelectionChange.pipe(
      switchMap((product) => {
        let createdElement = this._renderer.createElement('div') as HTMLElement;
        createdElement.innerHTML = product.shortDescription;
        let textContent = createdElement && createdElement.textContent;
        return of(textContent);
      }),
      tap((textContent: string) => {
        this.shortDescriptionExpanded = false;
        this.showMoreButtonIsDisplayed = textContent.length > MAX_CHAR_LENGTH;
        this._changeDetectorRef.markForCheck();
      })
    );
  }
}
