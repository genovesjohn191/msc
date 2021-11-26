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
  McsNetworkDbNetworkUpdate,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { createObject, isNullOrEmpty } from '@app/utilities';
import {
  BasicJobEditComponentBase,
  BasicFormConfig,
  UneditableField
} from '../../../../shared/basic-job-edit/basic-job-edit.component.base';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsNavigationService } from '@app/core';
import { NetworkDbNetworkDetailsService } from '../network-db-network.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'mcs-network-db-network-edit',
  templateUrl: '../../../../shared/basic-job-edit/basic-job-edit-template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkEditComponent extends BasicJobEditComponentBase<McsNetworkDbNetworkUpdate> {

  public network: McsNetworkDbNetwork;
  public settings: BasicFormConfig = {
    title: 'Network Details',
    panelHeader: 'Basic Information',
    inProgressMessage: ' Please wait while we update the network.',
    failedSendingRequestMessage: 'An unexpected server error has occured.',
    submitButtonText: 'Save'
  };

  public formConfig: DynamicFormFieldConfigBase[] = [
    new DynamicInputNetworkDbNetworkNameField({
      key: 'name',
      label: 'Network Name',
      placeholder: 'Enter a network name',
      validators: { required: true, maxlength: 255 }
    }),
    new DynamicInputTextField({
      key: 'description',
      label: 'Description',
      placeholder: 'Enter a description',
      validators: { maxlength: 1024 }
    }),
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
    })
  ];

  public formatPayload(form: DynamicFormComponent): McsNetworkDbNetworkUpdate {
    if (isNullOrEmpty(form)) { return new McsNetworkDbNetworkUpdate(); }

    let properties = form.getRawValue();

    return createObject(McsNetworkDbNetworkUpdate, {
      clientReferenceObject: {
        networkId: this.network.id
      },
      companyId: isNullOrEmpty(properties.company) ? null : properties.company[0].value,
      name: properties.name,
      description: properties.description,
      serviceId: properties.serviceId,
      useCaseId: Number(properties.useCaseId)
    });
  }

  public constructor(
    private _apiService: McsApiService,
    private _networkDetailService: NetworkDbNetworkDetailsService,
    private _navigationService: McsNavigationService,
    _changeDetector: ChangeDetectorRef,
    _eventDispatcher: EventBusDispatcherService
  ) {
    super(_changeDetector, _eventDispatcher);
    this._networkDetailService.getNetworkDetails().pipe(
      map(network => {
        this.network = network;
      })
    ).subscribe();
  }

  public getUneditableFields(): UneditableField[] {
    return [
      { type: 'text', label: 'VNI', value: this.network.vni, fallbackText: 'None' },
      { type: 'text', label: 'Multicast IP Address', value: this.network.multicastIpAddress, fallbackText: 'None' },
      { type: 'text', label: 'Created By', value: this.network.createdBy },
      { type: 'date', label: 'Created Date', value: this.network.createdOn },
      { type: 'text', label: 'Updated By', value: this.network.updatedBy },
      { type: 'date', label: 'Last Updated', value: this.network.updatedOn }
    ];
  }

  public send(payload: McsNetworkDbNetworkUpdate): Observable<McsJob> {
    return this._apiService.updateNetworkDbNetwork(this.network.id, payload);
  }

  public onJobComplete(job: McsJob) {
    this.refreshObjectDetails(job);
      this.navigateToPrevious();
  }

  private refreshObjectDetails(job: McsJob): void {
    let id = job?.clientReferenceObject?.networkId;
    this._apiService.getNetworkDbNetwork(id).pipe(
      map((network) => {
        if (isNullOrEmpty(network)) { return; }
        this._networkDetailService.setNetworkDetails(network);
      }
      )).subscribe();
  }

  private navigateToPrevious(): void {
    this._navigationService.navigateTo(
      RouteKey.LaunchPadNetworkDbNetworkDetails,
      [this.network.id.toString()]);
  }

  public setFormValues(): void {
    this.form.setFieldProperties({
      name: {
        value: this.network.name,
        whitelist: [this.network.name]
      },
      description: { value: this.network.description },
      company: { value: [{ value: this.network.companyId, label: this.network.companyName }] },
      serviceId: { value: this.network.serviceId },
      useCaseId: { value: this.network.useCaseId.toString() }
    });
  }
}