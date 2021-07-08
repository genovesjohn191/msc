import {
  ChangeDetectorRef,
  Component,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { McsIpValidatorService } from '@app/core';
import { McsNetworkDbNetworkQueryParams } from '@app/models';
import { McsApiService } from '@app/services';
import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicInputTextComponent } from '../input-text/input-text.component';
import { DynamicInputNetworkDbNetworkNameField } from './input-network-db-network-name';
import { isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-dff-input-network-db-network-name-field',
  templateUrl: '../shared-template/input-text.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputNetworkDbNetworkNameComponent),
      multi: true
    },
    McsIpValidatorService
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputNetworkDbNetworkNameComponent extends DynamicInputTextComponent {
  public config: DynamicInputNetworkDbNetworkNameField;

  // Filter variables
  private _companyId: string = '';
  private _unique: boolean = true;

  public constructor(
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'company-change':
        this._companyId = params.value;
        this._configureValidators();
        this.focusOut(this.config.value);
        break;
    }
  }

  public uniquenessValidator(inputValue: any): boolean {
    return this._unique;
  }

  public focusOut(inputValue: string): void {
    // Check if name is whitelisted
    let isWhiteListedName = this.config.whitelist.find((item) => item.trim() === inputValue.trim());

    if (isWhiteListedName || isNullOrEmpty(inputValue)) {
      this._unique = true;
      this.valueChange(inputValue);
      return;
    }

    this.isLoading = true;

    let queryParam = new McsNetworkDbNetworkQueryParams();
    queryParam.pageSize = 1;
    queryParam.companyId = this._companyId;
    queryParam.name = inputValue;

    this._apiService.getNetworkDbNetworks(queryParam)
    .pipe(
      catchError((error) => {
        this.isLoading = false;
        this._unique = true;
        this.valueChange(inputValue);
        return throwError('Failed to validate for network name.');
    }))
    .subscribe((result) => {
      this.isLoading = false;
      let match: boolean = result.totalCollectionCount > 0;

      let matchName = match && result.collection[0].name.trim() === inputValue.trim();
      this._unique = !matchName;
      this.valueChange(inputValue);
    })
  }

  private _configureValidators() {
    this.config.nameUniquenessValidator = this.uniquenessValidator.bind(this);
  }
}
