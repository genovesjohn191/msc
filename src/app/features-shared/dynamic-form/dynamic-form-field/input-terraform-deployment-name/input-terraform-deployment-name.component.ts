import {
  ChangeDetectorRef,
  Component,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { McsIpValidatorService } from '@app/core';
import {
  McsAzureDeploymentsQueryParams,
  McsAzureService
} from '@app/models';
import { McsApiService } from '@app/services';
import { isNullOrEmpty } from '@app/utilities';
import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicInputTextComponent } from '../input-text/input-text.component';
import { DynamicInputTerraformDeploymentNameField } from './input-terraform-deployment-name';

@Component({
  selector: 'mcs-dff-input-terraform-deployment-name-field',
  templateUrl: 'input-terraform-deployment-name.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputTerraformDeploymentNameComponent),
      multi: true
    },
    McsIpValidatorService
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputTerraformDeploymentNameComponent extends DynamicInputTextComponent {
  public config: DynamicInputTerraformDeploymentNameField;

  public isLoading: boolean = false;

  // Filter variables
  private _companyId: string = '';
  private _subscription: McsAzureService;
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
      case 'subscription-change':
        this._subscription = params.value;
        this.focusOut(this.config.value);
        break;
    }
  }

  public uniquenessValidator(inputValue: any): boolean {
    return this._unique;
  }

  private focusOut(inputValue: string): void {
    if (isNullOrEmpty(this._subscription)) {
      this._unique = true;
      this.valueChange(inputValue);
      return;
    }

    this.isLoading = true;

    let queryParam = new McsAzureDeploymentsQueryParams();
    queryParam.pageSize = 1;
    queryParam.companyId = this._companyId;
    queryParam.name = inputValue;

    this._apiService.getTerraformDeployments(queryParam)
    .pipe(
      catchError((error) => {
        this.isLoading = false;
        this._unique = true;
        this.valueChange(inputValue);
        return throwError('Failed to validate for deployment name.');
    }))
    .subscribe((result) => {
      this.isLoading = false;
      let match: boolean = result.totalCollectionCount > 0;
      let matchSubscription: boolean = match && result.collection[0].subscriptionId === this._subscription.subscriptionId;
      let matchName = match && result.collection[0].name.toLowerCase().trim() === inputValue.toLowerCase().trim();
      this._unique = !match || !matchSubscription || !matchName;
      this.valueChange(inputValue);
    })
  }

  private _configureValidators() {
    this.config.nameUniquenessValidator = this.uniquenessValidator.bind(this);
  }

  private _updateBehavior(required: boolean): void {
    this.updateVisiblityBasedOnRequirement(required);

    this._changeDetectorRef.markForCheck();
  }
}
