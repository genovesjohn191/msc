import {
  DynamicInputHiddenField,
  DynamicSelectUcsField,
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { LaunchPadForm } from './form.interface';
import { standardContextMapper } from './shared/standard-context-mapper';

export const ucsOrgCreateForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'platform',
      value: ''
    }),
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['ucsId'],
    }),
    new DynamicSelectUcsField({
      key: 'ucsId',
      label: 'UCS',
      validators: {required: true},
      contextualHelp: 'The UCS domain or UCS Central instance to create the organisation in.',
      eventName: 'ucs-change',
      dependents: ['domainGroupId', 'platform']
    }),
    new DynamicInputHiddenField({
      key: 'domainGroupId',
      value: ''
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    return mappedProperties;
  }
}
