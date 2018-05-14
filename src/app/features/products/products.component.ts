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
  Observable,
  Subscription,
  Subject
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError,
  switchMap
} from 'rxjs/operators';
import {
  Router,
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  McsTextContentProvider,
  McsDataStatusFactory,
  McsSearch,
  McsErrorHandlerService,
  CoreDefinition
} from '../../core';
import {
  unsubscribeSafely,
  refreshView,
  isNullOrEmpty
} from '../../utilities';
import { SlidingPanelComponent } from '../../shared';
import {
  ProductCatalog,
  Product
} from './models';
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
  public search: McsSearch;

  @ViewChild('slidingPanel')
  public slidingPanel: SlidingPanelComponent;

  public textContent: any;

  public catalogs: ProductCatalog[];
  public catalogListSource: ProductCatalogListSource | null;
  public catalogSubscription: Subscription;
  public selectedProduct: Product;

  public listStatusFactory: McsDataStatusFactory<ProductCatalog[]>;
  public productStatusFactory: McsDataStatusFactory<Product>;
  private _destroySubject = new Subject<void>();

  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_FONT_ELLIPSIS_VERTICAL;
  }

  constructor(
    private _router: Router,
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
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.catalogSubscription);
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  /**
   * Event that emits when user clicks on product
   * @param product Product to view
   */
  public onClickProduct(product: Product): void {
    if (isNullOrEmpty(product)) { return; }
    this.selectedProduct = product;
    this._navigateToProduct(product);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Toggles the sliding panel
   */
  public onToggleSlidingPanel(): void {
    if (isNullOrEmpty(this.slidingPanel)) { return; }
    this.slidingPanel.toggle();
  }

  /**
   * Navigate to product catalog
   * @param product Product to be navigated
   */
  private _navigateToProduct(product: Product): void {
    if (isNullOrEmpty(product)) { return; }
    this._router.navigate(['/products/', product.id]);
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
      .catch((error) => {
        this.listStatusFactory.setError();
        return Observable.throw(error);
      })
      .subscribe((response) => {
        this.catalogs = response;
        this.search.showLoading(false);
        this.listStatusFactory.setSuccesfull(response);
      });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listens to every params changed and get the product by id
   */
  private _getProductById(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      catchError((error) => {
        // Handle common error status code
        this.productStatusFactory.setError();
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      }),
      switchMap((params: ParamMap) => {
        this.productStatusFactory.setInProgress();
        let productId = params.get('id');
        this.selectedProduct = { id: productId } as Product;
        return this._productsRepository.findRecordById(productId);
      })
    )
      .subscribe((response) => {
        this.selectedProduct = response;
        this._productService.selectProduct(response);
        this.productStatusFactory.setSuccesfull(response);
      });
  }
}
