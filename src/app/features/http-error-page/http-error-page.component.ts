import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import {
  McsTextContentProvider,
  McsHttpStatusCode
} from '../../core';
import { unsubscribeSafely } from '../../utilities';

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
  public get errorCode(): McsHttpStatusCode {
    return this._errorCode;
  }
  public set errorCode(value: McsHttpStatusCode) {
    if (this._errorCode !== value) {
      this._errorCode = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _errorCode: McsHttpStatusCode = McsHttpStatusCode.Success;
  private _routeSubscription: Subscription;
  public get httpStatusCodeEnum(): any { return McsHttpStatusCode; }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.textContentAll = this._textProvider.content.pageHttpError;

    this._routeSubscription = this._activatedRoute.queryParamMap
      .subscribe((params) => {
        this.errorCode = +params.get('code');

        // We need to set manually the notFound error since there
        // are no parameter code in that case
        if (this.errorCode === 0) {
         this.errorCode = McsHttpStatusCode.NotFound;
        }
        this._setTextContent();
      });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._routeSubscription);
  }

  /**
   * Refresh the page
   */
  public refreshPage(): void {
    location.reload();
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

      case McsHttpStatusCode.NotFound:
      default:
        this.textContent = this.textContentAll.notFound;
        break;
    }
  }
}
