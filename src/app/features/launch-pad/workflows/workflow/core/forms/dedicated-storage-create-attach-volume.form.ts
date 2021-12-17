import {
  DynamicInputHiddenField,
  DynamicInputSizeField,
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
        { key: 'SPR', value: 'P700'},
        { key: 'PR2', value: 'P2000'},
        { key: 'PR8', value: 'P8000'},
        { key: 'PR16', value: 'P16000'}
      ]
    }),
    new DynamicInputSizeField({
      key: 'diskSizeInGB',
      label: 'Disk Size',
      placeholder: 'Enter disk size',
      validators: { required: true, minSize: 1, maxSize: 17592 },
      hint: 'Allowed value is 1 - 17592',
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
      maxItems: 1
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    let tierMap: Map<string, string> = new Map([
      ['PERFORMANCE-700', 'SPR'],
      ['PERFORMANCE-2000', 'PR2'],
      ['PERFORMANCE-8000', 'PR8'],
      ['PERFORMANCE-16000', 'PR16']
    ]);
    let crispTierValue = findCrispElementAttribute(CrispAttributeNames.Ic2StorageTier, attributes)?.value;
    if (!isNullOrEmpty(crispTierValue)) {
      mappedProperties.push({ key: 'tier', value: tierMap.get(crispTierValue.toString().toUpperCase()) });
    }

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
