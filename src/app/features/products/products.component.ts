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
  catchError
} from 'rxjs/operators';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  McsTextContentProvider,
  McsDataStatusFactory,
  McsSearch,
  McsErrorHandlerService
} from '../../core';
import {
  unsubscribeSafely,
  refreshView,
  isNullOrEmpty
} from '../../utilities';
import {
  ProductCatalog,
  Product
} from './models';
import { ProductCatalogRepository } from './product-catalog.repository';
import { ProductCatalogListSource } from './products.listsource';

@Component({
  selector: 'mcs-products',
  templateUrl: 'products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  @ViewChild('search')
  public search: McsSearch;

  public listStatusFactory: McsDataStatusFactory<ProductCatalog[]>;
  public catalogs: ProductCatalog[];
  public catalogListSource: ProductCatalogListSource | null;
  public catalogSubscription: Subscription;
  public selectedProduct: Product;
  public selectedProductId: string;

  private _destroySubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _productCatalogRepository: ProductCatalogRepository
  ) {
    this.listStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.products;
    this._listenToParamChange();
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
   * Listens to each parameter changed
   */
  private _listenToParamChange(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      catchError((error) => {
        // Handle common error status code
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
    )
      .subscribe((params) => {
        this.selectedProductId = params.get('id');
      });
  }
}
