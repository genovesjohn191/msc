import {
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicSelectChipsVmField,
  DynamicSelectField,
  DynamicSlideToggleField
} from '@app/features-shared/dynamic-form';
import { DynamicSelectChipsValue } from '@app/features-shared/dynamic-form/dynamic-form-field/dynamic-select-chips-field-component.base';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const dedicatedStorageCreateAndAttachVolumeForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['server'],
    }),
    new DynamicSelectField({
      key: 'tier',
      label: 'Storage Tier',
      validators: { required: true },
      options: [
        { key: 'Superior', value: 'Superior'},
        { key: 'Premium2', value: 'Premium 2'},
        { key: 'Performance-8000', value: 'Performance 8000'}
      ]
    }),
    new DynamicInputNumberField({
      key: 'diskSizeInGB',
      label: 'Disk Size',
      placeholder: 'Enter disk size',
      validators: { required: true, min: 1, max: 16384 },
      hint: 'Allowed value is 1 - 16384',
      suffix: 'GB'
    }),
    new DynamicSlideToggleField({
      key: 'bootLun',
      label: 'Boot'
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
      dataFilter: {
        hideNonDedicated: true,
        allowedHardwareType: [ 'BO', 'LO', 'BL' ]
      }
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'tier',
      value: findCrispElementAttribute(CrispAttributeNames.Ic2StorageTier, attributes)?.value } );

    mappedProperties.push({ key: 'diskSizeInGB',
      value: findCrispElementAttribute(CrispAttributeNames.Ic2DiskSpace, attributes)?.value } );

    let bootLun: boolean = findCrispElementAttribute(CrispAttributeNames.DesignatedUsage, attributes)?.value === 'BOOT';
    mappedProperties.push({ key: 'bootLun', value: bootLun } );

    let server: string = findCrispElementAttribute(CrispAttributeNames.Ic2Server, attributes)?.displayValue;
    let servers: DynamicSelectChipsValue[]  = [
      {
        value: server
      }
    ];
    mappedProperties.push({ key: 'server', value: servers } );


    return mappedProperties;
  }
}
