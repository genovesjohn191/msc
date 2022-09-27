import { DynamicInputHiddenField, DynamicInputServerPanelField } from '@app/features-shared/dynamic-form';
import { LaunchPadForm } from './form.interface';
import { standardContextMapper } from './shared/standard-context-mapper';

export const dedicatedBladeDeprovisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['serverId']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
      dependents: ['serverId']
    }),
    new DynamicInputServerPanelField({
      key: 'serverId',
      label: 'Target Blade',
      settings: { readonly: true, preserve: true },
      validators: { required: true },
      description: 'This workflow does not deprovision LUNs. Any relevant LUNs will simply have their masking and zoning removed for this blade.',
      multipleBladeFallback: 'Multiple blades with this service ID were found in the target company.',
      noBladeFallback: 'No blades with this service ID were found in the target company.'
    })
  ],

  mapContext: standardContextMapper

}
