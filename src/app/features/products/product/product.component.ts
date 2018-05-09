import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Observable,
  Subscription,
  Subject
} from 'rxjs';
import {
  switchMap,
  takeUntil,
  catchError
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsDataStatusFactory,
  McsErrorHandlerService,
  McsFileInfo
} from '../../../core';
import { isNullOrEmpty } from '../../../utilities';
import {
  Product,
  ProductDownload,
  ProductDependency
} from '../models';
import { ProductsRepository } from '../products.repository';

@Component({
  selector: 'mcs-product',
  templateUrl: 'product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProductComponent implements OnInit, OnDestroy {

  public textContent: any;
  public productSubscription: Subscription;
  public dataStatusFactory: McsDataStatusFactory<Product>;
  public product: Product;
  private _destroySubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _productsRepository: ProductsRepository
  ) {
    this.dataStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.products.product;
    this._getProductById();
  }

  public ngOnDestroy() {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

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

  public onClickDependency(dependency: ProductDependency): void {
    if (isNullOrEmpty(dependency)) { return; }
    this._router.navigate(['/products/', dependency.id]);
  }

  /**
   * Get Product based on the given ID in the provided parameter
   */
  private _getProductById(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      catchError((error) => {
        // Handle common error status code
        this.dataStatusFactory.setError();
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      }),
      switchMap((params: ParamMap) => {
        this.dataStatusFactory.setInProgress();
        let productId = params.get('id');
        return this._productsRepository.findRecordById(productId);
      })
    )
      .subscribe((response) => {
        this.product = response;
        this.dataStatusFactory.setSuccesfull(response);
      });
  }
}
