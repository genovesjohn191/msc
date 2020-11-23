import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { McsAuthenticationIdentity } from '@app/core';
import { McsCompany } from '@app/models';
import { McsApiService } from '@app/services';
import { CommonDefinition, isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-contact-us-widget',
  templateUrl: './contact-us-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ContactUsWidgetComponent implements OnInit {

  private _baseDestroySubject = new Subject<void>();
  public contactsInfo: McsCompany;
  public processing: boolean = false;
  public hasError: boolean = false;

  public get contactPersonIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_PERSON_FAV_BLACK;
  }

  public get activeUserCompanyId(): string {
    let switchedAccount = this._authenticationIdentity?.activeAccount?.id;
    let initialAccount = this._authenticationIdentity.user?.companyId
    return isNullOrEmpty(switchedAccount) ? initialAccount : switchedAccount;
  }

  constructor(
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _authenticationIdentity: McsAuthenticationIdentity
  ) {}

  ngOnInit() {
    this.getUserContactsInfo();
  }

  public getUserContactsInfo(): void {
    this.processing = true;
    this.hasError = false;
    this._apiService.getCompany(this.activeUserCompanyId)
    .pipe(
      catchError(() => {
        this.hasError = true;
        this.processing = false;
        this._changeDetectorRef.markForCheck();
        return throwError('Contact Us endpoint failed.');
      }),
      takeUntil(this._baseDestroySubject))
    .subscribe((response) => {
        this.contactsInfo = response;
        this.processing = false;
        this._changeDetectorRef.markForCheck();
    });
  }
}

