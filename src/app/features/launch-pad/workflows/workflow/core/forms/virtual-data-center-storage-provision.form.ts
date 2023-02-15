import {
  DynamicInputHiddenField,
  DynamicSelectVdcStorageField,
  DynamicInputStorageSizeField,
  DynamicStorageSlideToggleField,
  DynamicSelectStorageTierField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import { standardContextMapper } from './shared/standard-context-mapper';

export const virtualDataCenterStorageProvisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['iops', 'vdcId', 'limitMB', 'default']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
      dependents: ['vcloud']
    }),
    new DynamicSelectVdcStorageField({
      key: 'vdcId',
      label: 'Virtual Data Center',
      validators: { required: true }
    }),
    new DynamicInputStorageSizeField({
      key: 'limitMB',
      label: 'Size',
      placeholder: 'Enter Size',
      validators: { required: true },
      suffix: 'GiB',
      settings: { readonly: true, preserve: true }
    }),
    new DynamicSelectStorageTierField({
      key: 'iops',
      label: 'Tier',
      validators: { required: true },
      settings: { readonly: true, preserve: true }
    }),
    new DynamicStorageSlideToggleField({
      key: 'default',
      storagePanelTitle: 'Advanced Options',
      eventName: 'storage-toggle-change',
      dependents: ['preview'],
      defaultValue: false,
      previewValue: false,
      defaultLabel: 'Set as default',
      previewLabel: 'Preview only'
    }),
    new DynamicInputHiddenField({
      key: 'preview',
      value: false
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
  let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    return mappedProperties;
  }
}
