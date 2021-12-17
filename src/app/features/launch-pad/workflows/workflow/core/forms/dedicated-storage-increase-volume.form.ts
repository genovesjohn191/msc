import { DynamicInputSizeField } from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import { CrispAttributeNames, findCrispElementAttribute } from './mapping-helper';

export const dedicatedStorageIncreaseVolumeForm: LaunchPadForm = {
  config: [
    new DynamicInputSizeField({
      key: 'diskSizeInGB',
      label: 'New Size',
      placeholder: 'Enter new size',
      validators: { required: true, minSize: 1, maxSize: 17592 },
      hint: 'Allowed value is 1 - 17592',
      suffix: 'GB'
    }),
  ],

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'diskSizeInGB',
      value: findCrispElementAttribute(CrispAttributeNames.Ic2DiskSpace, attributes)?.value } );

    return mappedProperties;
  }
}
