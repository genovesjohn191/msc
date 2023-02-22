import { Injectable } from '@angular/core';
import {
  AbstractControl,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { CoreValidators } from '@app/core';

import { isNullOrEmpty } from '@app/utilities';
import { DynamicFormFieldConfig } from './dynamic-form-field-config.interface';

@Injectable()
export class DynamicFormValidationService {
  public getErrorMessage(control: AbstractControl): string {
    if (control.hasError('required')) {
      return 'You must enter a value';
    }
    if (control.hasError('minlength')) {
      return 'You must enter a minimum of ' + control.errors.minlength.requiredLength + ' characters';
    }
    if (control.hasError('min')) {
      return 'Must not be less than ' + control.errors.min.min;
    }
    if (control.hasError('max')) {
      return 'Must not exceed ' + control.errors.max.max;
    }
    if (control.hasError('minSize')) {
      return 'Must not be less than ' + control.errors.minSize.minSize;
    }
    if (control.hasError('maxSize')) {
      return `Must not exceed ${control.errors.maxSize.maxSize} for automation.
        </br>Need larger? Talk to a storage specialist.`;
    }
    if (control.hasError('ipAddress')) {
      return 'Please enter a valid IP address.';
    }
    if (control.hasError('privateIpAddress')) {
      return 'Please enter a valid private IP address.';
    }
    if (control.hasError('gatewayIpAddress')) {
      return `Please enter a valid private IP. It must not match the network's base IP or broadcast IP.`;
    }
    if (control.hasError('ipRange')) {
      return 'IP address must be in range';
    }
    if (control.hasError('ipIsGateway')) {
      return 'This IP address is reserved and cannot be used.';
    }
    if (control.hasError('subnetAutomationUnavailable')) {
      return 'This subnet is not available for provisioning at this time.';
    }
    if (control.hasError('unique')) {
      return 'Value must be unique.';
    }
    if (control.hasError('duplicateNameOnNetworkPanels')) {
      return 'Network name cannot match another network you are attempting to create for this customer.';
    }
    if (control.hasError('domain')) {
      return 'Incorrect domain format';
    }
    if (control.hasError('fqdnDomain')) {
      return 'Incorrect FQDN domain format';
    }
    if (control.hasError('accountUpn')) {
      return 'Incorrect account UPN format';
    }
    if (control.hasError('adomName')) {
      return 'Incorrect ADOM name format';
    }
    if (control.hasError('format')) {
      return 'Incorrect format';
    }
    if (control.hasError('containsQuestionMark')) {
      return 'Must not contain a question mark (?)';
    }
    if (control.hasError('profileStorageAccountName')) {
      return 'Incorrect profile storage account name format';
    }
    if (control.hasError('hostName')) {
      return 'Incorrect hostname format';
    }
    if (control.hasError('shortCustomerName')) {
      return 'Incorrect short customer name format';
    }
    if (control.hasError('ouPath')) {
      return 'Incorrect OU Path format';
    }
    if (control.hasError('networkAddress')) {
      return 'Invalid IP address';
    }
    if (control.hasError('networkPort')) {
      return 'Invalid port';
    }
    if (control.hasError('networkName')) {
      return 'Invalid network name format';
    }
    if (control.hasError('ucsDomainGroup')) {
      return 'Domain Group is a required field';
    }
  }

  public getValidators(controlData: DynamicFormFieldConfig): ValidatorFn[] {
    let validators: ValidatorFn[] = [];

    if (isNullOrEmpty(controlData)) {
      return validators;
    }

    // Validators based on configuration params
    let hasExplicitValidators = !isNullOrEmpty(controlData.validators);
    if (hasExplicitValidators) {
      if (controlData.validators.required) {
        validators.push(Validators.required);
      }
      if (controlData.validators.minlength > 0) {
        validators.push(Validators.minLength(controlData.validators.minlength));
      }
      if (controlData.validators.maxlength > 0) {
        validators.push(Validators.maxLength(controlData.validators.maxlength));
      }
      if (controlData.validators.min > 0) {
        validators.push(Validators.min(controlData.validators.min));
      }
      if (controlData.validators.max > 0) {
        validators.push(Validators.max(controlData.validators.max));
      }
      if (controlData.validators.minSize > 0) {
        validators.push(CoreValidators.minSize(controlData.validators.minSize));
      }
      if (controlData.validators.maxSize > 0) {
        validators.push(CoreValidators.maxSize(controlData.validators.maxSize));
      }
    }

    // Validators based on field type
    controlData.configureValidators(validators);

    return validators;
  }
}
