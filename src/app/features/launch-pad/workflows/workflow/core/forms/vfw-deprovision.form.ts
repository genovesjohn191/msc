import {
  DynamicInputHiddenField,
  DynamicSelectVdcField,
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { LaunchPadForm } from './form.interface';
import { standardContextMapper } from './shared/standard-context-mapper';

export const vfwDeprovisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['vdc']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
    }),
    new DynamicSelectVdcField({
      key: 'vdc',
      label: 'VDC',
      contextualHelp: 'The VDC this firewall is provisioned in. For stretched VDCs, please speak to a specialist.',
      eventName: 'resource-change',
      validators: { required: true },
      settings: { preserve: true },
      disableStretched: true
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {

    let mappedProperties: { key: string, value: any }[] = [];
    return mappedProperties;
  }
}