import {
  DynamicInputHiddenField,
  DynamicSelectField,
  DynamicSelectVmField
} from '@app/features-shared/dynamic-form';
import {
  McsObjectCrispElementServiceAttribute,
  PlatformType,
  ServiceType
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const hostSecurityProvisionHidsForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['server'],
    }),
    new DynamicSelectVmField({
      key: 'server',
      label: 'Target Server',
      validators: { required: true },
      useServiceIdAsKey: true,
      dataFilter: {
        hideDedicated: true,
        allowedServiceType: [ ServiceType.Managed ],
        allowedPlatformType: [ PlatformType.VCloud ]
      }
    }),
    new DynamicSelectField({
      key: 'protectionLevel',
      label: 'Protection Level',
      validators: { required: true },
      options: [
        { key: 'Detect', value: 'Detect'},
        { key: 'Protect', value: 'Protect'}
      ]
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'server',
      value: findCrispElementAttribute(CrispAttributeNames.ServerLink, attributes)?.displayValue } );

    mappedProperties.push({ key: 'protectionLevel',
      value: findCrispElementAttribute(CrispAttributeNames.HipsProtectionLvl, attributes)?.value } );

    return mappedProperties;
  }
}

export const hostSecurityProvisionHidsAddOnForm: LaunchPadForm = {
  config: [
    new DynamicSelectField({
      key: 'protectionLevel',
      label: 'Protection Level',
      validators: { required: true },
      options: [
        { key: 'Detect', value: 'Detect'},
        { key: 'Protect', value: 'Protect'}
      ]
    })
  ],

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'protectionLevel',
      value: findCrispElementAttribute(CrispAttributeNames.HipsProtectionLvl, attributes)?.value } );

    return mappedProperties;
  }
}
