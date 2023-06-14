import {
  DynamicInputHiddenField,
  DynamicInputTargetFirmwareVersionField,
  DynamicSelectFirewallField,
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { LaunchPadForm } from './form.interface';
import { standardContextMapper } from './shared/standard-context-mapper';

export const firewallUpgradeReadinessForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['firewallId']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
      dependents: ['firewallId']
    }),
    new DynamicSelectFirewallField({
      key: 'firewallId',
      label: 'Firewall',
      settings: { preserve: true },
      validators: { required: true },
    }),
    new DynamicInputTargetFirmwareVersionField({
      key: 'targetFirmwareVersion',
      label: 'Target Firmware Version',
      placeholder: 'Enter target firmware version',
      settings: { preserve: true }
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    return mappedProperties;
  }
}
