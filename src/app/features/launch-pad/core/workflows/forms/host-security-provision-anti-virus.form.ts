import {
  DynamicInputHiddenField,
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

export const hostSecurityProvisionAntiVirusForm: LaunchPadForm = {
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
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'server',
      value: findCrispElementAttribute(CrispAttributeNames.LinkSrvIdVav, attributes)?.displayValue } );

    return mappedProperties;
  }
}
