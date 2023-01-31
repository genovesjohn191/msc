import { 
  DynamicInputHiddenField, 
  DynamicSelectVdcField, 
  DynamicSlideToggleField 
} from '@app/features-shared/dynamic-form';
import { LaunchPadForm } from './form.interface';
import { standardContextMapper } from './shared/standard-context-mapper';

export const virtualDataCenterDeprovisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['uuid']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
      dependents: ['uuid']
    }),
    new DynamicSelectVdcField({
      key: 'uuid',
      label: 'Virtual Data Center',
      validators: { required: true },
      matchServiceIdInOptions: true,
      noVdcForServiceFallback: 'No VDCs with this service ID were found in the target company.'
    }),
    new DynamicSlideToggleField({
      key: `preserveMedia`,
      label: 'Preserve Media',
      value: true,
      contextualHelp: "If disabled, any media stored in this VDC will be deleted."
    })
  ],

  mapContext: standardContextMapper,
  
}
