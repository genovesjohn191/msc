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
  Subject,
  throwError,
  Observable
} from 'rxjs';
import {
  startWith,
  takeUntil,
  switchMap,
  catchError,
  tap,
  finalize,
  shareReplay
} from 'rxjs/operators';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  McsTextContentProvider,
  McsDataStatusFactory,
  McsErrorHandlerService,
  CoreDefinition,
  McsLoadingService
} from '@app/core';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import {
  Search,
  SlidingPanelComponent
} from '@app/shared';
import {
  RouteKey,
  McsProduct,
  McsProductCatalog
} from '@app/models';
import {
  ProductsRepository,
  ProductCatalogRepository
} from '@app/services';
import { ProductCatalogListSource } from './products.listsource';
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

  public catalogs$: Observable<McsProductCatalog[]>;
  public selectedProduct$: Observable<McsProduct>;
  public catalogListSource: ProductCatalogListSource | null;
  public listStatusFactory: McsDataStatusFactory<McsProductCatalog[]>;
  public productStatusFactory: McsDataStatusFactory<McsProduct>;
  private _destroySubject = new Subject<void>();

  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_FONT_ELLIPSIS_VERTICAL;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _loadingService: McsLoadingService,
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
    this._subscribeToProductById();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.search.searchChangedStream.pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());
      this._productsRepository.dataRecordsChanged.pipe(takeUntil(this._destroySubject))
        .subscribe(() => this._changeDetectorRef.markForCheck());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
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
    this.catalogs$ = this.catalogListSource.findAllRecordsStream().pipe(
      catchError((error) => {
        this.listStatusFactory.setError();
        return throwError(error);
      }),
      tap((response) => {
        this.search.showLoading(false);
        this.listStatusFactory.setSuccessful(response);
      }),
      finalize(() => this._changeDetectorRef.markForCheck())
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listens to every params changed and get the product by id
   */
  private _subscribeToProductById(): void {
    this.selectedProduct$ = this._activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.productStatusFactory.setInProgress();
        this._loadingService.showLoader(this.textContent.loadingDetails);
        return this._productsRepository.findRecordById(params.get('id')).pipe(
          finalize(() => this._loadingService.hideLoader())
        );
      }),
      catchError((error) => {
        this.productStatusFactory.setError();
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return throwError(error);
      }),
      tap((response) => {
        this._productService.selectProduct(response);
        this.productStatusFactory.setSuccessful(response);
        this._changeDetectorRef.markForCheck();
      }),
      shareReplay(1)
    );
  }
}
