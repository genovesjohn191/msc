import { DynamicInputSizeField } from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import { CrispAttributeNames, findCrispElementAttribute } from './mapping-helper';

export const dedicatedStorageIncreaseVolumeForm: LaunchPadForm = {
  config: [
    new DynamicInputSizeField({
      key: 'diskSizeInGB',
      label: 'New Provisioning Quota',
      placeholder: 'Enter new size',
      validators: { required: true, minSize: 1, maxSize: 17592 },
      hint: 'Allowed value is 1 - 17592',
      contextualHelp: 'Take care, we provision in GiB and the customer is charged in GB. 100Gb Disk Space Required is equivalent to 93Gib of provisioned storage.',
      suffix: 'GiB'
    }),
  ],

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    let provisionQuotaGib = findCrispElementAttribute(CrispAttributeNames.ProvisionQuotaGib, attributes)?.value;
    let provisionQuotaGib2 = findCrispElementAttribute(CrispAttributeNames.ProvisionQuotaGib2, attributes)?.value;
    mappedProperties.push({ key: 'diskSizeInGB', value: provisionQuotaGib ?? provisionQuotaGib2 } );

    return mappedProperties;
  }
}
