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

export const dedicatedStorageCreateAndAttachVolumeClusterForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['servers'],
    }),
    new DynamicSelectField({
      key: 'tier',
      label: 'Storage Tier',
      validators: { required: true },
      options: [
        { key: 'Superior', value: 'Superior'},
        { key: 'Premium2', value: 'Premium 2'},
        { key: 'SPR', value: 'Performance7000'},
        { key: 'PR2', value: 'Performance2000'},
        { key: 'PR8', value: 'Performance8000'},
        { key: 'PR16', value: 'Performance16000'}
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
      key: 'servers',
      label: 'Servers',
      placeholder: 'Search for name or service ID...',
      contextualHelp: 'Select one or more target servers. You can also enter service IDs manually if the target servers exist only in UCS Central',
      validators: { required: true },
      allowCustomInput: true,
      useServiceIdAsKey: true
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
    mappedProperties.push({ key: 'servers', value: servers } );

    return mappedProperties;
  }
}
