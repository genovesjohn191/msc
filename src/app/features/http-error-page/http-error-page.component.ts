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
  public textHeader: string;
  public textContent: any;

  /**
   * Error code of the current http request
   */
  public get errorCode(): HttpStatusCode { return this._errorCode; }
  public set errorCode(value: HttpStatusCode) {
    if (this._errorCode !== value) {
      this._errorCode = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _errorCode: HttpStatusCode = HttpStatusCode.Success;

  private _destroySubject = new Subject<void>();
  public get httpStatusCodeEnum(): any { return HttpStatusCode; }

  public constructor(
    private _locationService: Location,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService
  ) { }

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
        this._setTextContent();
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
   * Set the text content based on the status code obtained in the parameter
   */
  private _setTextContent(): void {
    // TODO: can be stored to map, make a configuration class and set the status
    switch (this.errorCode) {
      case HttpStatusCode.InternalServerError:
        this.textContent = this._translateService.instant('pageHttpError.internalServerError');
        break;

      case HttpStatusCode.Unprocessable:
        this.textContent = this._translateService.instant('pageHttpError.unprocessable');
        break;

      case HttpStatusCode.ServiceUnavailable:
        this.textContent = this._translateService.instant('pageHttpError.serviceUnavailable');
        break;

      case HttpStatusCode.Unauthorized:
        this.textContent = this._translateService.instant('pageHttpError.unauthorized');
        break;

      case HttpStatusCode.Forbidden:
        this.textContent = this._translateService.instant('pageHttpError.forbidden');
        break;

      case HttpStatusCode.ReadOnlyMode:
        this.textContent = this._translateService.instant('pageHttpError.readOnlyMode');
        break;

      case HttpStatusCode.NotFound:
        this.textContent = this._translateService.instant('pageHttpError.notFound');
        break;

      default:
        this.textHeader = this.errorCode.toString();
        this.textContent = this._translateService.instant('pageHttpError.genericError');
        break;
    }
  }
}
