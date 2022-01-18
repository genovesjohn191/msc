import {
  forwardRef,
  Component,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import {
  Observable,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  takeUntil
} from 'rxjs/operators';

import { McsIpValidatorService } from '@app/core';
import { McsCompany } from '@app/models';
import { McsApiService } from '@app/services';
import {
  compareStrings,
  isNullOrEmpty,
  removeNonAlphaNumericChars
} from '@app/utilities';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicInputTextComponent } from '../input-text/input-text.component';
import { DynamicInputShortCustomerNameField } from './input-short-customer-name';

@Component({
  selector: 'mcs-dff-input-short-customer-name-field',
  templateUrl: '../shared-template/input-text.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputShortCustomerNameComponent),
      multi: true
    },
    McsIpValidatorService
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputShortCustomerNameComponent extends DynamicInputTextComponent {
  public config: DynamicInputShortCustomerNameField;

  private _tenant: string;
  private _companyId: string;
  private _destroySubject: Subject<void> = new Subject<void>();
  private currentServiceCall: Subscription;

  constructor(
    private _apiService: McsApiService
  ) {
    super();
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'tenant-change':
        let sameTenant = compareStrings(this._tenant, params?.value?.name) === 0;
        if (sameTenant || isNullOrEmpty(params?.value?.name)) { return; }
        this._tenant = params?.value?.name;
        this.config.value = this.formatShortCustomerName(params?.value?.name);
        this.valueChange(this.config.value);
        break;

      case 'company-change':
        let sameCompany = compareStrings(this._companyId, params?.value) === 0;
        if (sameCompany || isNullOrEmpty(params?.value)) { return; }
        this._companyId = params?.value;
        this.mapServiceId();
        break;
    }
  }

  public formatShortCustomerName(text: string): string {
    // remove all non-alphanumeric and truncate to max length of chars
    return removeNonAlphaNumericChars(text).substring(0, this.config.validators.maxlength);
  }

  public mapServiceId(): void {
    if (!isNullOrEmpty(!this.config.useCompanyName)) { return; }
    if (this.currentServiceCall) {
      this.currentServiceCall.unsubscribe();
    }

    this.config.value = '';

    this.currentServiceCall = this.callService()
      .pipe(
        takeUntil(this._destroySubject),
        switchMap(() => this.callService()),
        catchError(() => {
          return throwError(`${this.config.key} data retrieval failed.`);
        }))
      .subscribe((response: McsCompany) => {
        let currentUser = response;

        if (!isNullOrEmpty(currentUser.name)) {
          let name = this.formatShortCustomerName(currentUser.name);
          this.config.value = name;
          this.valueChange(this.config.value);
        }
      });
  }

  protected callService(): Observable<McsCompany> {
    return this._apiService.getCompany(this._companyId).pipe(
      takeUntil(this._destroySubject),
      map((response) => response));
  }
}
