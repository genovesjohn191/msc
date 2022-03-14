import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import {
  Observable,
  of,
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

import {
  McsAzureService,
  McsAzureServicesRequestParams
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
import { DynamicInputSubscriptionIdField } from './input-subscription-id';

@Component({
  selector: 'mcs-dff-input-subscription-id-field',
  templateUrl: './input-subscription-id.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputSubscriptionIdComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputSubscriptionIdComponent extends DynamicFieldComponentBase {
  public config: DynamicInputSubscriptionIdField;
  private _linkedServiceId: string;
  private _companyId: string = '';
  private _destroySubject: Subject<void> = new Subject<void>();

  private currentServiceCall: Subscription;

  public constructor(private _apiService: McsApiService) {
    super();
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'linked-service-id-change':
        this._linkedServiceId = params.value;
        this.mapServiceId();
        break;

      case 'company-change':
        this._companyId = params.value;
        this.mapServiceId();
        break;
    }
  }

  public mapServiceId(): void {
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
      .subscribe((response: McsAzureService[]) => {
        let services = response;
        let serviceFound = services.find((service) => service.serviceId === this._linkedServiceId);

        if (!isNullOrEmpty(serviceFound)) {
          this.config.foreignKeyValue = serviceFound.id;
          this.config.value = serviceFound.subscriptionId;
          this.valueChange(this.config.value);
        }
      });
  }

  protected callService(): Observable<McsAzureService[]> {
    if (isNullOrEmpty(this._companyId)) { return of([]); }

    let param = new McsAzureServicesRequestParams();
    param.pageSize = CommonDefinition.PAGE_SIZE_MAX;

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    return this._apiService.getAzureServices(param, optionalHeaders).pipe(
      takeUntil(this._destroySubject),
      map((response) => response && response.collection));
  }
}
