import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Renderer2,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Observable,
  of
} from 'rxjs';
import {
  tap,
  switchMap,
  map,
  shareReplay
} from 'rxjs/operators';
import {
  CoreRoutes,
  CoreDefinition
} from '@app/core';
import {
  isNullOrEmpty,
  animateFactory,
  getSafeProperty,
  compareStrings
} from '@app/utilities';
import {
  RouteKey,
  McsFileInfo,
  McsProduct,
  McsProductDownload,
  McsProductDependency,
  McsProductOptionProperty,
  McsProductOption
} from '@app/models';
import { ProductService } from './product.service';
import { ScrollableLinkGroup } from '@app/shared';

const MAX_CHAR_LENGTH = 200;
const PRODUCT_OPTION_TYPE_NUMERIC = 'numeric';

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

export class ProductComponent implements OnInit, OnDestroy {
  public shortDescriptionExpanded: boolean;
  public showMoreButtonIsDisplayed: boolean;
  public selectedProduct$: Observable<McsProduct>;
  public selectedProductTextContent$: Observable<string>;

  // Table columns
  // TODO: transfer to en.json
  public thresholdColumns = ['description', 'alertThreshold'];
  public productOptionsColumns = ['name', 'properties', 'options'];
  public userCasesColumns = ['name', 'description'];

  @ViewChild('scrollableLinkGroup')
  private _scrollableLink: ScrollableLinkGroup;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef,
    private _productService: ProductService
  ) { }

  public ngOnInit() {
    this._subscribeToProductResolver();
    this._subscribeToTextChange();
  }

  public ngOnDestroy() {
    this._productService.removeSelectedProduct();
  }

  public get cloudIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOUD_BLUE;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
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
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.ProductDetails), dependency.id]);
  }

  /**
   * Toggles the short-description content
   */
  public toggleShortDescription(): void {
    this.shortDescriptionExpanded = !this.shortDescriptionExpanded;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Returns the property array with proper formatting
   */
  public getFormattedProperties(productOption: McsProductOption): string[] {
    if (isNullOrEmpty(productOption) || isNullOrEmpty(productOption.properties)) { return []; }
    return productOption.type.toLowerCase() === PRODUCT_OPTION_TYPE_NUMERIC ?
      this._getPropertiesNumericFormat(productOption.properties) :
      this._getPropertiesDefaultFormat(productOption.properties);
  }

  /**
   * Returns the properties with default format when the property array has 1 or more than 2 items
   * Format is "Label: Value Unit"
   */
  private _getPropertiesDefaultFormat(properties: McsProductOptionProperty[]): string[] {
    let formattedProperties = [];
    for (let property of properties) {
      if (!isNullOrEmpty(property.value)) {
        formattedProperties.push(`${property.label}: ${property.value} ${property.unit}`);
      }
    }
    return formattedProperties;
  }

  /**
   * Returns the properties with range format when the property array length has 2 items
   * Format same unit "LowerValue-HigherValue Unit"
   * Format different unit "first value unit - second value unit"
   */
  private _getPropertiesNumericFormat(properties: McsProductOptionProperty[]): string[] {
    if (properties.length !== 2) { return this._getPropertiesDefaultFormat(properties); }

    let firstProperty = properties[0];
    let secondProperty = properties[1];
    let firstValue = +getSafeProperty(firstProperty, (obj) => obj.value, 0);
    let secondValue = +getSafeProperty(secondProperty, (obj) => obj.value, 0);

    let minValue = Math.min(firstValue, secondValue);
    let maxValue = Math.max(firstValue, secondValue);

    return compareStrings(firstProperty.unit, secondProperty.unit) === 0 ?
      [`${minValue}-${maxValue} ${secondProperty.unit}`] :
      [`${firstProperty.value} ${firstProperty.unit}-
        ${secondProperty.value} ${secondProperty.unit}`];
  }

  /**
   * Subscribes to product resolver
   */
  private _subscribeToProductResolver(): void {
    this.selectedProduct$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.product)),
      tap(() => {
        if (isNullOrEmpty(this._scrollableLink)) { return; }
        this._scrollableLink.reset();
      }),
      shareReplay(1)
    );
  }

  /**
   * Subscribe to short text change
   */
  private _subscribeToTextChange(): void {
    this.selectedProductTextContent$ = this.selectedProduct$.pipe(
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
