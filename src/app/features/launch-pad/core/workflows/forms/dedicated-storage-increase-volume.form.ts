import { DynamicInputNumberField } from '@app/features-shared/dynamic-form';
import { LaunchPadForm } from './form.interface';

export const dedicatedStorageIncreaseVolumeForm: LaunchPadForm = {
  config: [
    new DynamicInputNumberField({
      key: 'diskSizeInGB',
      label: 'Disk Size',
      placeholder: 'Enter disk size',
      validators: { required: true, min: 1, max: 16384 },
      hint: 'Allowed value is 1 - 16384',
      suffix: 'GB'
    }),
  ],
  mapContext: null
}
