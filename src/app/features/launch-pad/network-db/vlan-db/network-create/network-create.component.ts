import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild
} from '@angular/core';
import { MatVerticalStepper } from '@angular/material/stepper';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IMcsNavigateAwayGuard } from '@app/core';
import {
  DynamicFormComponent,
  DynamicFormFieldConfigBase,
  DynamicInputTextField,
  DynamicSelectChipsCompanyField,
  DynamicSelectNetworkDbUseCaseField as DynamicSelectNetworkDbUseCaseField,
} from '@app/features-shared/dynamic-form';
import {
  McsNetworkDbNetwork,
  McsNetworkDbNetworkCreate,
  McsTerraformDeploymentCreate,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  cloneDeep,
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-network-db-network-create',
  templateUrl: './network-create.component.html',
  styleUrls: [ ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkCreateComponent implements IMcsNavigateAwayGuard {
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
      eventName: 'company-change'
    }),
    new DynamicInputTextField({
      key: 'name',
      label: 'Network Name',
      placeholder: 'Enter a network name',
      validators: { required: true, maxlength: 255 },
    }),
    new DynamicInputTextField({
      key: 'serviceId',
      label: 'Service ID',
      placeholder: 'Enter a service ID',
      validators: { maxlength: 30 },
    }),
    new DynamicSelectNetworkDbUseCaseField({
      key: 'useCaseId',
      label: 'Use Case',
      validators: { required: true }
    }),
    new DynamicInputTextField({
      key: 'description',
      label: 'Description',
      placeholder: 'Enter a description',
      validators: { maxlength: 1024 },
    })
  ]

  public get payload(): McsNetworkDbNetworkCreate {
    if (isNullOrEmpty(this.form)) { return new McsNetworkDbNetworkCreate(); }

    let properties = this.form.getRawValue();

    return {
      companyId: isNullOrEmpty(properties.company) ? null :  properties.company[0].value,
      name: properties.name,
      description: properties.description,
      serviceId: properties.serviceId,
      useCaseId: Number(properties.useCaseId)
    }
  }

  public get isValidPayload(): boolean {
    return this.form && this.form.valid;
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

  public createNetwork(): void {
    this.hasError = false;
    this.processing = true;

    this._apiService.createNetworkDbNetwork(this.payload)
    .pipe(catchError(() => {
      this.hasError = true;
      this.processing = false;

      this._changeDetector.markForCheck();

      return throwError('Network creation endpoint failed.');
    }))
    .subscribe((response: McsNetworkDbNetwork) => {
      this.hasError = false;
      this.processing = false;
      this.id = response.id.toString();
      this.creationSuccessful = true;

      this._changeDetector.markForCheck();

      this.stepper.selected.completed = true;
      this.stepper.next();
    });
  }

  public retryCreation(): void {
    this.hasError = false;
    this.processing = false;
    this._changeDetector.markForCheck();
  }

  public canNavigateAway(): boolean {
    return true;
  }

  public clone(data: McsTerraformDeploymentCreate): any {
    return cloneDeep(data);
  }
}