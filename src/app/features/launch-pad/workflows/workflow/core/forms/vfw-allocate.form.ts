import {
  DynamicInputHiddenField,
  DynamicSelectField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const vfwAllocateForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
    }),
    new DynamicSelectField({
      key: 'size',
      label: 'Firewall Size',
      options: [
        {key: 'Small', value: 'Small'},
        {key: 'Medium', value: 'Medium'},
        {key: 'Large', value: 'Large'}
        ],
      validators: { required: true },
      contextualHelp: 'The size of the firewall.'
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    let ic2Version = findCrispElementAttribute(CrispAttributeNames.Ic2Version, attributes);
    if (!isNullOrUndefined(ic2Version)){
      let sizeValue = '';
      switch(ic2Version.displayValue){
        case 'Small - Fortinet':
        case 'Small - F5 APM':
          sizeValue = 'Small';
          break;
        case 'Medium - Fortinet':
        case 'Medium - F5 APM':
          sizeValue = 'Medium';
          break;
        case 'Large - Fortinet':
        case 'Large - F5 APM':
          sizeValue = 'Large';
          break;
        default:
          sizeValue = ic2Version.displayValue;
      }
      mappedProperties.push({
        key: 'size',
        value: sizeValue
      });
    }
    return mappedProperties;
  }
}
