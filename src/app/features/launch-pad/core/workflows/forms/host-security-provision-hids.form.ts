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
import { WorkflowGroupSaveState } from '../workflow-group.interface';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';

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
  mapContext: (context: WorkflowGroupSaveState) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(context)) { return mappedProperties; }

    mappedProperties.push({ key: 'companyId', value: context.companyId });

    return mappedProperties;
  },
  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'server', value: findCrispElementAttribute(CrispAttributeNames.ServerLink, attributes)?.displayValue } );

    return mappedProperties;
  }
}
