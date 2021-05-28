import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatVerticalStepper } from '@angular/material/stepper';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ContentChange } from 'ngx-quill';

import { IMcsNavigateAwayGuard } from '@app/core';
import {
  DynamicFormComponent,
  DynamicFormFieldConfigBase,
  DynamicFormFieldDataChangeEventParam,
  DynamicInputTerraformDeploymentNameField,
  DynamicInputTextField,
  DynamicSelectChipsCompanyField,
  DynamicSelectChipsTerraformModuleField,
  DynamicSelectChipsTerraformTagField,
  DynamicSelectTenantField,
  DynamicSelectTerraformModuleTypeField
} from '@app/features-shared/dynamic-form';
import { DynamicSelectAzureSubscriptionField } from '@app/features-shared/dynamic-form/dynamic-form-field/select-azure-subscription/select-azure-subscription';
import {
  McsAzureService,
  McsTenant,
  McsTerraformDeployment,
  McsTerraformDeploymentCreate,
  McsTerraformTag,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  cloneDeep,
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';

interface DeploymentInfo {
  tenant: string;
  subscription: string;
  name: string;
  module: string;
  tag: string;
  variables: string;
}

@Component({
  selector: 'mcs-deployment-create',
  templateUrl: './azure-deployment-create.component.html',
  styleUrls: [ ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentCreateComponent implements IMcsNavigateAwayGuard, OnInit {
  @ViewChild('form')
  public form: DynamicFormComponent;

  @ViewChild('stepper')
  protected stepper: MatVerticalStepper;

  public formConfig: DynamicFormFieldConfigBase[] = [
    new DynamicSelectChipsCompanyField({
      key: 'company',
      label: 'Company',
      placeholder: 'Search for name or company ID...',
      validators: { required: true },
      allowCustomInput: true,
      maxItems: 1,
      eventName: 'company-change',
      dependents: ['tenant', 'subscription', 'moduleType', 'module', 'tag', 'name']
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
      validators: { required: true },
      eventName: 'subscription-change',
      dependents: ['name'],
      useSubscriptionIdAsKey: true
    }),
    new DynamicInputTerraformDeploymentNameField({
      key: 'name',
      label: 'Deployment Name',
      placeholder: 'Enter a deployment name',
      validators: { required: true, minlength: 1, maxlength: 255 },
    }),
    new DynamicSelectTerraformModuleTypeField({
      key: 'moduleType',
      label: 'Module Type',
      validators: { required: true },
      eventName: 'terraform-module-type-change',
      dependents: ['module']
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
      maxItems: 1,
      eventName: 'terraform-tag-change'
    })
  ]

  public tfvarsEditorForm: FormGroup;

  public deploymentInfo: DeploymentInfo = {
    tenant: '',
    subscription: '',
    name: '',
    module: '',
    tag: '',
    variables: ''
  };

  public get payload(): McsTerraformDeploymentCreate {
    if (isNullOrEmpty(this.form)) { return new McsTerraformDeploymentCreate(); }
    // Return valid workflow structure
    let properties = this.form.getRawValue();

    return {
      name: properties.name,
      subscriptionId: properties.subscription,
      tfvars: this.deploymentInfo.variables,
      tag: !isNullOrEmpty(properties.tag) ? properties.tag[0].value : ''
    };
  }

  public get validDeploymentInfo(): boolean {
    return this.validDeploymentDetails && this.validVariables;
  }

  public get validDeploymentDetails(): boolean {
    return this.form && this.form.valid;
  }

  public get validVariables(): boolean {
    return !isNullOrEmpty(this.deploymentInfo?.variables);
  }

  public get successIconKey(): string {
    return CommonDefinition.ASSETS_SVG_SUCCESS;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public id: string;
  public processing: boolean = false;
  public hasError: boolean = false;
  public creationSuccessful: boolean = false

  public constructor(private _apiService: McsApiService, private _changeDetector: ChangeDetectorRef) { }

  public ngOnInit(): void {
    this.tfvarsEditorForm = new FormGroup({
      tfvars: new FormControl(Validators.required)
    });
  }

  public gotoVariables(): void {
    let properties = this.form.getRawValue();

    this.deploymentInfo.name = properties.name.toString();
    this.deploymentInfo.module = !isNullOrEmpty(properties.module) ? properties.module[0].label.toString() : '';
    this.deploymentInfo.tag = !isNullOrEmpty(properties.tag) ? properties.tag[0].label.toString() : '';

    this._changeDetector.markForCheck();

    let inFirstStep = this.stepper.selectedIndex === 0;
    if (inFirstStep) {
      this.stepper.selected.completed = true;
    }

    this.stepper.selectedIndex = 1;
  }

  public createDeployment(): void {
    this.hasError = false;
    this.processing = true;

    this._apiService.createTerraformDeployment(this.payload)
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;

      this._changeDetector.markForCheck();

      return throwError('Terraform deployment creation endpoint failed.');
    }))
    .subscribe((response: McsTerraformDeployment) => {
      this.hasError = false;
      this.processing = false;
      this.id = response.id;
      this.creationSuccessful = true;

      this._changeDetector.markForCheck();

      let inSecondStep = this.stepper.selectedIndex === 1;
      if (inSecondStep) {
        this.stepper.selected.completed = true;
      }

      this.stepper.next();
    });
  }

  public retryCreation(): void {
    this.hasError = false;
    this.processing = false;
    this._changeDetector.markForCheck();
  }

  public canNavigateAway(): boolean {
    return this.creationSuccessful || isNullOrEmpty(this.deploymentInfo.tenant);
  }

  public clone(data: McsTerraformDeploymentCreate): any {
    return cloneDeep(data);
  }

  public onVariablesChanged(param: string): void {
    this.deploymentInfo.variables = param;
  }

  public formAfterDataChanged(): void {
    let invalidFirstForm: boolean = !(this.form && this.form.valid) && !isNullOrEmpty(this.stepper);
    if (invalidFirstForm) {
      // Disable switching between first and second steps
      this.stepper.selectedIndex = 1;
      this.stepper.selected.completed = false;
      this.stepper.selectedIndex = 0;
      this.stepper.selected.completed = false;
    }
  }

  public formBeforeDataChanged(params: DynamicFormFieldDataChangeEventParam): void {
    if (isNullOrEmpty(params)) {
      return;
    }

    switch (params.eventName) {
      case 'tenant-change':
        if (!isNullOrEmpty(params.value)) {
          let value = params.value as McsTenant;
          this.deploymentInfo.tenant = value.name;
        }

        break;

      case 'subscription-change':
        if (!isNullOrEmpty(params.value)) {
          let value = params.value as McsAzureService;
          this.deploymentInfo.subscription = value.friendlyName;
        }

        break;

      case 'terraform-tag-change':
        if (!isNullOrEmpty(params.value)) {
          let value = params.value as McsTerraformTag;
          this.tfvarsEditorForm.get('tfvars').setValue(value.tfvars);
        }

        break;
    }
  }
}