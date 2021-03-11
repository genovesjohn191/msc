import { DynamicInputTextField } from '@app/features-shared/dynamic-form';
import { LaunchPadForm } from './form.interface';
import { standardContextMapper } from './shared/standard-context-mapper';

export const RenameInManagementToolsForm: LaunchPadForm = {
  config: [
    new DynamicInputTextField({
      key: 'name',
      label: 'Management Name',
      placeholder: 'Enter management name',
      validators: { required: true, minlength: 1, maxlength: 200 },
    })
  ],
  mapContext: standardContextMapper,
}
