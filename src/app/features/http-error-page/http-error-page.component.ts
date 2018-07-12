import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsHttpStatusCode
} from '../../core';
import { unsubscribeSubject, isNullOrEmpty } from '../../utilities';

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
  public textContentAll: any;

  /**
   * Error code of the current http request
   */
  public get errorCode(): McsHttpStatusCode { return this._errorCode; }
  public set errorCode(value: McsHttpStatusCode) {
    if (this._errorCode !== value) {
      this._errorCode = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _errorCode: McsHttpStatusCode = McsHttpStatusCode.Success;
  private _destroySubject = new Subject<void>();
  public get httpStatusCodeEnum(): any { return McsHttpStatusCode; }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _locationService: Location
  ) { }

  public ngOnInit() {
    this.textContentAll = this._textProvider.content.pageHttpError;
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
          this.errorCode = McsHttpStatusCode.NotFound;
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
    switch (this.errorCode) {
      case McsHttpStatusCode.InternalServerError:
        this.textContent = this.textContentAll.serverError;
        break;

      case McsHttpStatusCode.Unprocessable:
        this.textContent = this.textContentAll.unprocessable;
        break;

      case McsHttpStatusCode.ServiceUnavailable:
        this.textContent = this.textContentAll.serviceUnavailable;
        break;

      case McsHttpStatusCode.Forbidden:
        this.textContent = this.textContentAll.forbidden;
        break;

      case McsHttpStatusCode.NotFound:
      default:
        this.textContent = this.textContentAll.notFound;
        break;
    }
  }
}
