import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  forwardRef,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  McsNetworkDbNetwork,
  McsNetworkDbNetworkQueryParams
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicInputTextComponent } from '../input-text/input-text.component';
import { DynamicInputNetworkDbNetworkNameField } from './input-network-db-network-name';

@Component({
  selector: 'mcs-dff-input-network-db-network-name-field',
  templateUrl: '../shared-template/input-text.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputNetworkDbNetworkNameComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputNetworkDbNetworkNameComponent extends DynamicInputTextComponent {
  public config: DynamicInputNetworkDbNetworkNameField;

  // Filter variables
  private _companyId: string = null;
  private _unique: boolean = true;
  private _hasDuplicateNameWithinPanels: boolean = true;

  public constructor(
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'company-change':
        this._companyId = isNullOrEmpty(params.value) ? null : params.value;
        this._configureValidators();
        this.focusOut(this.config.value);
        break;
    }
  }

  public uniquenessValidator(inputValue: any): boolean {
    return this._unique;
  }
  public duplicateNameInPanelsValidator(inputValue: any): boolean {
    return this._hasDuplicateNameWithinPanels;
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
    queryParam.pageSize = 10;
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
      let match: McsNetworkDbNetwork = null;
      if(result.totalCollectionCount > 0) {
        match = result.collection.find(item => item.companyId=== this._companyId
          && item.name.trim() === inputValue.trim());
      }
      this._hasDuplicateNameWithinPanels = this._hasDuplicateNameWithinNetworkPanels();
      this._unique = isNullOrUndefined(match);
      this.valueChange(inputValue);
    })
  }

  private _configureValidators() {
    this.config.nameUniquenessValidator = this.uniquenessValidator.bind(this);
    this.config.duplicateNameOnPanelsValidator = this.duplicateNameInPanelsValidator.bind(this);
  }

  private _hasDuplicateNameWithinNetworkPanels(): boolean {
    let panelWithNameValue = this.config.networkItems?.filter((item) => {
      let itemCompanyValue = isNullOrEmpty(item.dynamicFormConfig[0]?.value) ? null : item.dynamicFormConfig[0]?.value[0]?.value;
      let sameCompany = itemCompanyValue === this._companyId;
      let sameNetworkName =  item.dynamicFormConfig[2].value === this.config.value;
      return sameCompany && sameNetworkName;
    });
    return panelWithNameValue?.length <= 1;
  }
}
