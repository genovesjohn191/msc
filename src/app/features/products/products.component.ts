import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import {
  Subscription,
  Subject,
  throwError
} from 'rxjs';
import {
  startWith,
  takeUntil,
  switchMap,
  catchError
} from 'rxjs/operators';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  McsTextContentProvider,
  McsDataStatusFactory,
  McsErrorHandlerService,
  CoreDefinition
} from '@app/core';
import {
  unsubscribeSafely,
  refreshView,
  isNullOrEmpty,
  unsubscribeSubject
} from '@app/utilities';
import {
  Search,
  SlidingPanelComponent
} from '@app/shared';
import {
  McsRouteKey,
  McsProduct,
  McsProductCatalog
} from '@app/models';
import { ProductCatalogRepository } from './product-catalog.repository';
import { ProductCatalogListSource } from './products.listsource';
import { ProductsRepository } from './products.repository';
import { ProductService } from './product/product.service';

@Component({
  selector: 'mcs-products',
  templateUrl: 'products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: Search;

  @ViewChild('slidingPanel')
  public slidingPanel: SlidingPanelComponent;

  public textContent: any;

  public catalogs: McsProductCatalog[];
  public catalogListSource: ProductCatalogListSource | null;
  public catalogSubscription: Subscription;
  public selectedProduct: McsProduct;

  public listStatusFactory: McsDataStatusFactory<McsProductCatalog[]>;
  public productStatusFactory: McsDataStatusFactory<McsProduct>;
  private _destroySubject = new Subject<void>();

  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_FONT_ELLIPSIS_VERTICAL;
  }

  public get routeKeyEnum(): any {
    return McsRouteKey;
  }

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _productService: ProductService,
    private _productsRepository: ProductsRepository,
    private _productCatalogRepository: ProductCatalogRepository
  ) {
    this.listStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
    this.productStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.products;
    this._getProductById();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.search.searchChangedStream.pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());
      this._productsRepository.dataRecordsChanged.pipe(takeUntil(this._destroySubject))
        .subscribe(() => this._changeDetectorRef.markForCheck());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.catalogSubscription);
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Toggles the sliding panel
   */
  public onToggleSlidingPanel(): void {
    if (isNullOrEmpty(this.slidingPanel)) { return; }
    this.slidingPanel.toggle();
  }

  /**
   * Initializes the list source for product listing
   */
  private _initializeListsource(): void {
    this.catalogListSource = new ProductCatalogListSource(
      this._productCatalogRepository,
      this.search
    );

    // Listen to all records changed
    this.catalogListSource.findAllRecordsStream()
      .pipe(
        catchError((error) => {
          this.listStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.catalogs = response;
        this.search.showLoading(false);
        this.listStatusFactory.setSuccessful(response);
      });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listens to every params changed and get the product by id
   */
  private _getProductById(): void {
    this._activatedRoute.paramMap
      .pipe(
        takeUntil(this._destroySubject),
        switchMap((params: ParamMap) => {
          this.productStatusFactory.setInProgress();
          let productId = params.get('id');
          this.selectedProduct = { id: productId } as McsProduct;
          return this._productsRepository.findRecordById(productId);
        }),
        catchError((error) => {
          // Handle common error status code
          this.productStatusFactory.setError();
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.selectedProduct = response;
        this._productService.selectProduct(response);
        this.productStatusFactory.setSuccessful(response);
      });
  }
}
