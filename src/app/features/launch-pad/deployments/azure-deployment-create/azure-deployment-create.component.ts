import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

import { IMcsNavigateAwayGuard } from '@app/core';
import {
  DynamicFormFieldConfigBase,
  DynamicInputTextField,
  DynamicSelectChipsCompanyField,
  DynamicSelectField
} from '@app/features-shared/dynamic-form';

@Component({
  selector: 'mcs-deployment-create',
  templateUrl: './azure-deployment-create.component.html',
  styleUrls: [ ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeploymentCreateAzureComponent implements IMcsNavigateAwayGuard {
  public config = {
    toolbar: [
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    ]
  };

  public fieldData: DynamicFormFieldConfigBase[] = [
    new DynamicSelectChipsCompanyField({
      key: 'company',
      label: 'Company',
      placeholder: 'Search for name or company ID...',
      validators: { required: true },
      allowCustomInput: true,
      maxItems: 1,
      dependents: []
    }),
    new DynamicSelectField({
      key: 'tenant',
      label: 'Tenant',
      // validators: { required: true },
      options: [
        { key: 'key1', value: 'value1'},
        { key: 'key2', value: 'value2'},
      ],
      hint: 'Hint for tenant goes here...'
    }),
    new DynamicSelectField({
      key: 'subscription',
      label: 'Subscription',
      // validators: { required: true },
      options: [
        { key: 'key1', value: 'value1'},
        { key: 'key2', value: 'value2'},
      ],
      hint: 'Hint for subscription goes here...'
    }),
    new DynamicInputTextField({
      key: 'name',
      label: 'Deployment Name',
      placeholder: 'Enter a deployment name',
      // validators: { required: true, minlength: 1, maxlength: 20 },
      hint: 'Hint for name goes here...'
    }),
    new DynamicSelectField({
      key: 'module',
      label: 'Module',
      // validators: { required: true },
      options: [
        { key: 'key1', value: 'value1'},
        { key: 'key2', value: 'value2'},
      ],
      hint: 'Hint for module goes here...'
    }),
    new DynamicSelectField({
      key: 'tag',
      label: 'Tag',
      // validators: { required: true },
      options: [
        { key: 'key1', value: 'value1'},
        { key: 'key2', value: 'value2'},
      ],
      hint: 'Hint for tag goes here...'
    })
  ]

  public canNavigateAway(): boolean {
    return true;
  }
}