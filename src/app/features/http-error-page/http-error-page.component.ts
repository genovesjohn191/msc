import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpStatusCode } from '@app/models';
import {
  unsubscribeSubject,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-http-error-page',
  templateUrl: './http-error-page.component.html',
  styleUrls: ['./http-error-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'http-error-page-wrapper'
  }
})

export class HttpErrorPageComponent implements OnInit, OnDestroy {
  public textContent: any;
  private _httpErrorTextContentMap: Map<HttpStatusCode, any>;
  private _destroySubject = new Subject<void>();

  public get httpStatusCodeEnum(): any {
    return HttpStatusCode;
  }

  public get errorCode(): HttpStatusCode { return this._errorCode; }
  public set errorCode(value: HttpStatusCode) {
    if (this._errorCode !== value) {
      this._errorCode = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _errorCode: HttpStatusCode = HttpStatusCode.Success;

  public constructor(
    private _locationService: Location,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService
  ) {
    this._initializeHttpErrorTextContentMap();
  }

  public ngOnInit() {
    this._listenToParamChanges();
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Refresh the page
   */
  public refreshPage(): void {
    location.reload();
  }

  /**
   * Listens to each param changes
   */
  private _listenToParamChanges(): void {
    this._activatedRoute.queryParamMap
      .pipe(takeUntil(this._destroySubject))
      .subscribe((params) => {
        this.errorCode = +params.get('code');
        this._preserveUrl(params.get('preservedUrl'));
        // We need to set manually the notFound error since there
        // are no parameter code in that case
        if (this.errorCode === 0) {
          this.errorCode = HttpStatusCode.NotFound;
        }
        this._setTextContent(this.errorCode);
      });
  }

  /**
   * This will preserved the url since the skipLocation flag of router
   * is not working as expected when the error was called under canActivate guard
   * @param url Url to be preserved
   */
  private _preserveUrl(preservedUrl: string): void {
    if (isNullOrEmpty(preservedUrl)) { return; }
    this._locationService.replaceState(preservedUrl);
  }

  /**
   * Set the current text content based on the type of error code,
   * Set to generic if its not in the map
   * @param errorCode the current error code
   */
  private _setTextContent(errorCode: HttpStatusCode): void {
    this.textContent = this._httpErrorTextContentMap.has(errorCode) ?
      this._httpErrorTextContentMap.get(errorCode) :
      this._translateService.instant('pageHttpError.genericError');

    this._changeDetectorRef.markForCheck();
  }

  /**
   * Initialize and populate the values of the http error text content map
   */
  private _initializeHttpErrorTextContentMap(): void {
    this._httpErrorTextContentMap = new Map();

    this._httpErrorTextContentMap.set(
      HttpStatusCode.Unauthorized,
      this._translateService.instant('pageHttpError.unauthorized')
    );
    this._httpErrorTextContentMap.set(
      HttpStatusCode.Forbidden,
      this._translateService.instant('pageHttpError.forbidden')
    );
    this._httpErrorTextContentMap.set(
      HttpStatusCode.NotFound,
      this._translateService.instant('pageHttpError.notFound')
    );
    this._httpErrorTextContentMap.set(
      HttpStatusCode.NotAllowed,
      this._translateService.instant('pageHttpError.notFound')
    );
    this._httpErrorTextContentMap.set(
      HttpStatusCode.ReadOnlyMode,
      this._translateService.instant('pageHttpError.readOnlyMode')
    );
    this._httpErrorTextContentMap.set(
      HttpStatusCode.Unprocessable,
      this._translateService.instant('pageHttpError.unprocessable')
    );
    this._httpErrorTextContentMap.set(
      HttpStatusCode.InternalServerError,
      this._translateService.instant('pageHttpError.internalServerError')
    );
    this._httpErrorTextContentMap.set(
      HttpStatusCode.ServiceUnavailable,
      this._translateService.instant('pageHttpError.serviceUnavailable')
    );
  }
}
