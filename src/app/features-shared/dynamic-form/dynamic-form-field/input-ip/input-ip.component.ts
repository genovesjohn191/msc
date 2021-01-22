import {
  ChangeDetectorRef,
  Component,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { McsIpValidatorService } from '@app/core';
import {
  McsResource,
  McsResourceNetwork,
  McsResourceNetworkIpAddress
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicInputTextComponent } from '../input-text/input-text.component';
import { DynamicInputIpField } from './input-ip';

@Component({
  selector: 'mcs-dff-input-ip-field',
  templateUrl: 'input-ip.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputIpComponent),
      multi: true
    },
    McsIpValidatorService
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputIpComponent extends DynamicInputTextComponent {
  public config: DynamicInputIpField;
  private _hasInitialized: boolean = false;

  // Filter variables
  private _companyId: string = '';
  private _resource: McsResource;
  private _network: McsResourceNetwork;

  public netMasks: any[];
  public ipAddressesInUsed: McsResourceNetworkIpAddress[];

  public constructor(
    private _ipValidationService: McsIpValidatorService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super();
    this.resetNetworkIpInformation();
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'ip-mode-change':
        this._updateBehavior(params.value);
        break;

      case 'company-change':
        this._companyId = params.value;
        break;

      case 'resource-change':
        this._resource = params.value as McsResource;
        this.resetNetworkIpInformation();
        break;

      case 'network-change':
        this._network = params.value as McsResourceNetwork;
        this.initNetworkIpInformation();
        break;
    }
  }

  public isIpAddressInUsed(ipAddress: string): boolean {
    return this._ipValidationService.isIpAddressInUsed(ipAddress);
  }

  private resetNetworkIpInformation(): void {
    this._ipValidationService.resetNetworkIpInformation();
  }

  private initNetworkIpInformation(): void {
    let networkInfoComplete = this.config.useNetworkRange && !isNullOrEmpty(this._resource) && !isNullOrEmpty(this._network);
    if (!networkInfoComplete) { return; }

    this._configureValidators();
  }

  private _configureValidators() {
    this.netMasks = this._ipValidationService.initNetworkIpInformation(this._resource, this._network, this._companyId);
    this.config.ipRangeValidator = this._ipValidationService.ipRangeValidator.bind(this);
    this.config.ipGatewayValidator = this._ipValidationService.ipGatewayValidator.bind(this);
  }

  private _updateBehavior(mode: string ): void {
    let required = mode.toLowerCase() === 'manual';

    let hasValidators = !isNullOrEmpty(this.config.validators);
    if (hasValidators) {
      this.config.validators.required = required

    } else {
      this.config.validators = { required };
    }

    let hasSettings = !isNullOrEmpty(this.config.settings);
    if (hasSettings) {
      this.config.settings.hidden = !required;
    } else {
      this.config.settings = { hidden: !required };
    }

    this.disabled = !required;

    this.clearFormField(false);

    // Set initial value if required
    if (required && !this._hasInitialized) {
      this.setInitialValue(this.config.initialValue);
      this._hasInitialized = true;
    }

    this._changeDetectorRef.markForCheck();
  }
}
