import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { IMcsNavigateAwayGuard } from '@app/core';
import {
  DynamicFormFieldConfigBase,
  DynamicInputTextField,
  DynamicSelectChipsCompanyField,
  DynamicSelectChipsTerraformModuleField,
  DynamicSelectChipsTerraformTagField,
  DynamicSelectTenantField
} from '@app/features-shared/dynamic-form';
import { DynamicSelectAzureSubscriptionField } from '@app/features-shared/dynamic-form/dynamic-form-field/select-azure-subscription/select-azure-subscription';

@Component({
  selector: 'mcs-deployment-create',
  templateUrl: './azure-deployment-create.component.html',
  styleUrls: [ ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentCreateComponent implements IMcsNavigateAwayGuard {
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
      eventName: 'company-change',
      dependents: ['tenant', 'subscription', 'module', 'tag']
    }),
    new DynamicSelectTenantField({
      key: 'tenant',
      label: 'Tenant',
      validators: { required: true },
      eventName: 'tenant-change',
      dependents: ['subscription']
    }),
    new DynamicSelectAzureSubscriptionField({
      key: 'subscription',
      label: 'Subscription',
      validators: { required: true }
    }),
    new DynamicInputTextField({
      key: 'name',
      label: 'Deployment Name',
      placeholder: 'Enter a deployment name',
      validators: { required: true, minlength: 1, maxlength: 50 },
    }),
    new DynamicSelectChipsTerraformModuleField({
      key: 'module',
      label: 'Module',
      placeholder: 'Search for a module...',
      validators: { required: true },
      maxItems: 1,
      eventName: 'terraform-module-change',
      dependents: ['tag']
    }),
    new DynamicSelectChipsTerraformTagField({
      key: 'tag',
      label: 'Tag',
      placeholder: 'Search for a module tag...',
      validators: { required: true },
      maxItems: 1
    })
  ]

  public canNavigateAway(): boolean {
    return true;
  }
}