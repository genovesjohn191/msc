import { DynamicSelectField } from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';

export const addOnHidsForm: LaunchPadForm = {
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

  // CRISP Element Mapper
  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];

    mappedProperties.push({ key: 'protectionLevel',
                            value: findCrispElementAttribute(CrispAttributeNames.HidsProtectionLevel, attributes)?.value } );

    return mappedProperties;
  }
};
