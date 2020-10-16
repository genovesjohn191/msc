import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  map,
  tap,
  shareReplay
} from 'rxjs/operators';
import {
  RouteKey,
  McsCatalogProduct,
  McsCatalogProductOption,
  McsCatalogProductOptionProperty,
  CatalogViewType,
  McsCatalogProductPciDetail
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition,
  compareStrings,
  createObject
} from '@app/utilities';
import { ScrollableLinkGroup } from '@app/shared';
import { CatalogService } from '../catalog.service';
import {
  CatalogItemDetails,
  CatalogHeader,
  CatalogType
} from '../shared';

const PRODUCT_OPTION_TYPE_NUMERIC = 'numeric';

@Component({
  selector: 'mcs-catalog-product',
  templateUrl: './product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'product-wrapper'
  }
})
export class ProductComponent implements OnInit {

  public product$: Observable<McsCatalogProduct>;
  public productOptionsColumns = ['name', 'options'];
  public thresholdColumns = ['description', 'alertThreshold'];
  public pciComplianceColumns = [
    'raci',
    'mcsResponsibilityDefinition',
    'customerResponsibilityDefinition',
    'notApplicableJustification',
    'control',
    'requirement',
    'version'
  ];

  @ViewChild('scrollableLinkGroup')
  private _scrollableLink: ScrollableLinkGroup;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _catalogService: CatalogService
  ) { }

  public ngOnInit(): void {
    this._subscribeToProductResolver();
  }

  public get cloudIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOUD_BLUE;
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  /**
   * Returns the sorted Pci Details based on the passed sorting predicate
   */
  public sortPciDetails(pciDetails: McsCatalogProductPciDetail[]): McsCatalogProductPciDetail[] {
    return pciDetails.sort(this._sortPciDetailsPredicate.bind(this));
  }

  /**
   * Returns the property array with proper formatting
   */
  public getFormattedProperties(productOption: McsCatalogProductOption): string[] {
    if (isNullOrEmpty(productOption) || isNullOrEmpty(productOption.properties)) { return []; }
    return productOption.type.toLowerCase() === PRODUCT_OPTION_TYPE_NUMERIC ?
      this._getPropertiesNumericFormat(productOption.properties) :
      this._getPropertiesDefaultFormat(productOption.properties);
  }

  /**
   * Returns the properties with range format when the property array length has 2 items
   * Format same unit "LowerValue-HigherValue Unit"
   * Format different unit "first value unit - second value unit"
   */
  private _getPropertiesNumericFormat(properties: McsCatalogProductOptionProperty[]): string[] {
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
   * Returns the properties with default format when the property array has 1 or more than 2 items
   * Format is "Label: Value Unit"
   */
  private _getPropertiesDefaultFormat(properties: McsCatalogProductOptionProperty[]): string[] {
    let formattedProperties = [];
    for (let property of properties) {
      if (!isNullOrEmpty(property.value)) {
        formattedProperties.push(`${property.label}: ${property.value} ${property.unit}`);
      }
    }
    return formattedProperties;
  }

  /**
   * Subscribes to product catalog resolver
   */
  private _subscribeToProductResolver(): void {
    this.product$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.product)),
      tap((product) => {
        if (!isNullOrEmpty(product)) {
          this._catalogService.updateActiveCatalogItemDetails(createObject(CatalogItemDetails, {
            id: product.id,
            catalogViewType: CatalogViewType.Product,
            catalogType: CatalogType.Products,
            header: createObject(CatalogHeader, {
              title: product.name,
              prefix: product.serviceIdPrefix,
              version: product.version
            })
          }));
          this._catalogService.updateCatalogItemMenuByType(CatalogType.Products, true);
        }
        if (isNullOrEmpty(this._scrollableLink)) { return; }
        this._scrollableLink.reset();
      }),
      shareReplay(1)
    );
  }

  private _sortPciDetailsPredicate(pciDetailA: McsCatalogProductPciDetail, pciDetailB: McsCatalogProductPciDetail): number {
    if (pciDetailA.displayOrder < pciDetailB.displayOrder) { return -1; }
    if (pciDetailA.displayOrder > pciDetailB.displayOrder) { return 1; }
    return 0;
  }
}
