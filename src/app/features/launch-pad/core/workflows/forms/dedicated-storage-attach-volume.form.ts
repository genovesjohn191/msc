import {
  DynamicInputHiddenField,
  DynamicSelectChipsVmField,
  DynamicSelectVmField
} from '@app/features-shared/dynamic-form';
import { DynamicSelectChipsValue } from '@app/features-shared/dynamic-form/dynamic-form-field/dynamic-select-chips-field-component.base';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { WorkflowGroupSaveState } from '../workflow-group.interface';
import { LaunchPadForm } from './form.interface';
import { CrispAttributeNames, findCrispElementAttribute } from './mapping-helper';

export const dedicatedStorageAttachVolumeForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['server'],
    }),
    new DynamicSelectChipsVmField({
      key: 'server',
      label: 'Server',
      placeholder: 'Search for name or service ID...',
      contextualHelp: 'Select a target server, or enter a service ID manually if the target server exists only in UCS Central',
      validators: { required: true },
      allowCustomInput: true,
      useServiceIdAsKey: true,
      maxItems: 1,
      hideNonDedicated: true,
      allowedHardwareType: [ 'BO', 'LO', 'BL' ]
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

    let server: string = findCrispElementAttribute(CrispAttributeNames.Server, attributes)?.displayValue;
    let servers: DynamicSelectChipsValue[]  = [
      {
        value: server
      }
    ];
    mappedProperties.push({ key: 'server', value: servers } );

    return mappedProperties;
  }
}
