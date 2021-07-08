import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import { Observable } from 'rxjs';

import {
  DynamicFormComponent,
  DynamicFormFieldConfigBase,
  DynamicInputNetworkDbNetworkNameField,
  DynamicInputTextField,
  DynamicSelectChipsCompanyField,
  DynamicSelectNetworkDbUseCaseField
} from '@app/features-shared/dynamic-form';
import {
  McsJob,
  McsNetworkDbNetwork,
  McsNetworkDbNetworkCreate,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { isNullOrEmpty } from '@app/utilities';
import {
  BasicJobFormComponentBase,
  BasicFormConfig
} from '@app/features/launch-pad/shared/basic-job-form/basic-job-form.component.base';
import { EventBusDispatcherService } from '@app/event-bus';

@Component({
  selector: 'mcs-network-db-network-create',
  templateUrl: '../../../shared/basic-job-form/basic-job-form-template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkCreateComponent extends BasicJobFormComponentBase<McsNetworkDbNetworkCreate> {

  public settings: BasicFormConfig = {
    title: 'Network Details',
    inProgressMessage: ' Please wait while we create the network.',
    failedSendingRequestMessage: 'An unexpected server error has occured.',
    submitButtonText: 'Create',

    successful: {
      title: 'New Network Creation',

      newObjectLink: {
        id: 'go-to-network-details-link',
        text: 'View network',
        eventTracker: 'navigate-to-network-details',
        eventCategory: 'network-db-networks',
        eventLabel: 'network-db-network-creation'
      }
    }
  };

  public formConfig: DynamicFormFieldConfigBase[] =[
    new DynamicSelectChipsCompanyField({
      key: 'company',
      label: 'Company',
      placeholder: 'Search for name or company ID...',
      validators: { required: true },
      allowCustomInput: true,
      maxItems: 1,
      eventName: 'company-change',
      dependents: ['name']
    }),
    new DynamicInputNetworkDbNetworkNameField({
      key: 'name',
      label: 'Network Name',
      placeholder: 'Enter a network name',
      validators: { required: true, maxlength: 255 }
    }),
    new DynamicInputTextField({
      key: 'serviceId',
      label: 'Service ID',
      placeholder: 'Enter a service ID',
      validators: { maxlength: 30 }
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
      validators: { maxlength: 1024 }
    })
  ];

  public formatPayload(form: DynamicFormComponent): McsNetworkDbNetworkCreate {
    if (isNullOrEmpty(form)) { return new McsNetworkDbNetworkCreate(); }

    let properties = form.getRawValue();

    return {
      companyId: isNullOrEmpty(properties.company) ? null :  properties.company[0].value,
      name: properties.name,
      description: properties.description,
      serviceId: properties.serviceId,
      useCaseId: Number(properties.useCaseId)
    }
  }

  public constructor(
    private _apiService: McsApiService,
    changeDetector: ChangeDetectorRef,
    eventDispatcher: EventBusDispatcherService) {

    super(changeDetector, eventDispatcher);
  }

  public send(payload: McsNetworkDbNetworkCreate): Observable<McsJob> {
    return this._apiService.createNetworkDbNetwork(payload);
  }

  public getNewObjectRouterLinkSettings(newObject: McsJob): any[] {
    return [RouteKey.LaunchPadNetworkDbNetworkDetails, newObject.tasks[0].referenceObject.id.toString()];
  }

  public getSuccessMessage(newObject: McsJob): string {
    return `<strong>${newObject.tasks[0].referenceObject.name}</strong> successfully created` ;
  }
}