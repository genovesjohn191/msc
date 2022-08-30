import {
  throwError,
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  finalize,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { EnquiryformViewModel } from '@app/features-shared';
import {
  CatalogViewType,
  McsCatalogEnquiryRequest,
  McsCatalogProduct,
  McsCatalogProductOption,
  McsCatalogProductOptionProperty,
  McsCatalogProductPciDetail,
  McsCatalogProductUseCase,
  McsStateNotification,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { ScrollableLinkGroup } from '@app/shared';
import {
  compareStrings,
  createObject,
  getSafeFormValue,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

import { CatalogService } from '../catalog.service';
import {
  CatalogHeader,
  CatalogItemDetails,
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
  public showEnquiryForm: boolean;
  public selectedUseCase$: Observable<McsCatalogProductUseCase>;
  public product$: Observable<McsCatalogProduct>;
  public processOnGoing = new BehaviorSubject<boolean>(false);

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

  private _selectedUseCaseChange = new BehaviorSubject<McsCatalogProductUseCase>(null);
  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _activatedRoute: ActivatedRoute,
    private _catalogService: CatalogService,
    private _apiService: McsApiService,
    private _eventBusDispatcher: EventBusDispatcherService
  ) { }

  public ngOnInit(): void {
    this._subscribeToSelectedUseCaseChange();
    this._subscribeToProductResolver();
  }

  public get cloudIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOUD_BLUE;
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public onClickUseCase(useCase: McsCatalogProductUseCase): void {
    this._selectedUseCaseChange.next(useCase);
  }

  public onSubmitEnquiry(viewmodel: EnquiryformViewModel, productId: string): void {
    if (isNullOrEmpty(viewmodel)) { return; }

    let enquiryRequest = new McsCatalogEnquiryRequest();
    enquiryRequest.notes = getSafeFormValue(viewmodel.fcNote, obj => obj.value);
    enquiryRequest.preferredContactMethod = +getSafeFormValue(viewmodel.fcContact, obj => obj.value);

    this.processOnGoing.next(true);
    this._apiService.createCatalogProductEnquiry(productId, enquiryRequest)
      .pipe(
        tap(() => {
          this._eventBusDispatcher.dispatch(McsEvent.stateNotificationShow,
            new McsStateNotification('success', 'message.thankyouRequest'));
        }),
        catchError(error => {
          this._eventBusDispatcher.dispatch(McsEvent.stateNotificationShow,
            new McsStateNotification(
              'error', 'message.enquiryError',
              this._onShowEnquiryPanel.bind(this)
            ));
          return throwError(() => error);
        }),
        finalize(() => {
          this.processOnGoing.next(false);
          this.showEnquiryForm = false;
          this._changeDetectorRef.markForCheck();
        })
      ).subscribe();
  }

  public sortPciDetails(pciDetails: McsCatalogProductPciDetail[]): McsCatalogProductPciDetail[] {
    return pciDetails.sort(this._sortPciDetailsPredicate.bind(this));
  }

  public getFormattedProperties(productOption: McsCatalogProductOption): string[] {
    if (isNullOrEmpty(productOption) || isNullOrEmpty(productOption.properties)) { return []; }
    return productOption.type.toLowerCase() === PRODUCT_OPTION_TYPE_NUMERIC ?
      this._getPropertiesNumericFormat(productOption.properties) :
      this._getPropertiesDefaultFormat(productOption.properties);
  }

  public sortProductOptions(productOptions: McsCatalogProductOption[]): McsCatalogProductOption[] {
    // sort product options displayOrder in ascending order
    return productOptions.sort((productOptionA, productOptionB) => productOptionA.displayOrder - productOptionB.displayOrder);
  }

  private _onShowEnquiryPanel(): void {
    this.showEnquiryForm = true;
    this._changeDetectorRef.markForCheck();
  }

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

  private _getPropertiesDefaultFormat(properties: McsCatalogProductOptionProperty[]): string[] {
    let formattedProperties = [];
    for (let property of properties) {
      if (!isNullOrEmpty(property.value)) {
        formattedProperties.push(`${property.label}: ${property.value} ${property.unit}`);
      }
    }
    return formattedProperties;
  }

  private _subscribeToProductResolver(): void {
    this.product$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.product)),
      tap((product) => {
        if (!isNullOrEmpty(product)) {
          let catalogItemDetails = new CatalogItemDetails();
          catalogItemDetails.id = product.id;
          catalogItemDetails.data = product;
          catalogItemDetails.catalogViewType = CatalogViewType.Product;
          catalogItemDetails.catalogType = CatalogType.Products;
          catalogItemDetails.header = createObject(CatalogHeader, {
            title: product.name,
            prefix: product.serviceIdPrefix,
            version: product.version
          });

          this._catalogService.updateActiveCatalogItemDetails(catalogItemDetails);
          this._catalogService.updateCatalogItemMenuByType(CatalogType.Products, true);
        }
        if (isNullOrEmpty(this._scrollableLink)) { return; }
        this._scrollableLink.reset();
        this.showEnquiryForm = false;
        this._changeDetectorRef.markForCheck();
      }),
      shareReplay(1)
    );
  }

  private _subscribeToSelectedUseCaseChange(): void {
    this.selectedUseCase$ = this._selectedUseCaseChange.pipe(
      takeUntil(this._destroySubject)
    );
  }

  private _sortPciDetailsPredicate(pciDetailA: McsCatalogProductPciDetail, pciDetailB: McsCatalogProductPciDetail): number {
    if (pciDetailA.displayOrder < pciDetailB.displayOrder) { return -1; }
    if (pciDetailA.displayOrder > pciDetailB.displayOrder) { return 1; }
    return 0;
  }
}
