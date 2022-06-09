import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList
} from '@angular/core';
import { Observable } from 'rxjs';

import {
  DynamicFormComponent,
  DynamicInputNetworkDbNetworkNameField,
  DynamicInputTextField,
  DynamicSelectChipsCompanyField,
  DynamicSelectNetworkDbUseCaseField,
  DynamicSelectChipsServiceField,
  DynamicSlideToggleField,
  DynamicFormFieldConfigBase,
  DynamicSelectPodsService,
  DynamicSelectPodsField
} from '@app/features-shared/dynamic-form';
import {
  McsJob,
  McsMultiJobFormConfig,
  McsNetworkDbNetworkCreate,
  McsNetworkDbNetworkCreateItem,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  coerceBoolean,
  createObject,
  isNullOrEmpty
} from '@app/utilities';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  MultiJobFormComponentBase,
  MultiFormConfig
} from '@app/features/launch-pad/shared/multi-job-form/multi-job-form.component.base';

@Component({
  selector: 'mcs-network-db-network-create',
  templateUrl: '../../../shared/multi-job-form/multi-job-form-template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkCreateComponent extends MultiJobFormComponentBase<McsNetworkDbNetworkCreate> {

  public settings: MultiFormConfig = {
    header: 'Create a New Network',
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
        eventLabel: 'network-db-network-creation',
      }
    }
  };

  public constructor(
    private _apiService: McsApiService,
    private _podService: DynamicSelectPodsService,
    elementRef: ElementRef,
    changeDetector: ChangeDetectorRef,
    eventDispatcher: EventBusDispatcherService)
  {
    super(changeDetector, elementRef, eventDispatcher);
    this.addItem();
  }

  public formatPayload(form: QueryList<DynamicFormComponent>): McsNetworkDbNetworkCreate {
    let networkItems: McsNetworkDbNetworkCreateItem[] = [];
    if (form?.length === 0) { return; }
    form.forEach((formDetail) => {
      let properties = formDetail.getRawValue();
      networkItems.push(createObject(McsNetworkDbNetworkCreateItem, {
        companyId: isNullOrEmpty(properties.company) ? null : properties.company[0].value,
        name: properties.name,
        description: properties.description,
        serviceId: isNullOrEmpty(properties.serviceId) ? null : properties.serviceId[0].label.toString(),
        useCaseId: Number(properties.useCaseId),
        isMazaa: properties.isMazaa === '' ? false : properties.isMazaa,
        pods: properties.pods
      }))
    });
    return {
      networks: networkItems
    };
  }

  public send(payload: McsNetworkDbNetworkCreate): Observable<McsJob> {
    return this._apiService.createNetworkDbNetwork(payload);
  }

  public getNewObjectRouterLinkSettings(refId: string): any[] {
    return [RouteKey.LaunchPadNetworkDbNetworkDetails, refId.toString()];
  }

  public getSuccessMessage(name: string): string {
    return `<strong>${name}</strong> successfully created</br>`;
  }

  public addItem(item?: McsMultiJobFormConfig, event?: PointerEvent): void {
    event?.stopPropagation();
    this.multiFormItems.push(createObject(McsMultiJobFormConfig, {
      formTitle: `Network ${this.multiFormItems?.length + 1}`,
      dynamicFormConfig: [
        new DynamicSelectChipsCompanyField({
          key: 'company',
          label: 'Company',
          placeholder: 'Search for name or company ID...',
          allowCustomInput: false,
          maxItems: 1,
          eventName: 'company-change',
          dependents: ['name','serviceId'],
          contextualHelp: 'Optionally, select a company to create this network for.',
          value: this.copyValue(item?.dynamicFormConfig, 'company')
        }),
        new DynamicSelectChipsServiceField({
          key: 'serviceId',
          label: 'Service ID',
          placeholder: 'Search for a Service ID...',
          allowCustomInput: true,
          maxItems: 1,
          contextualHelp: 'Select a service ID, or manually enter a dummy service ID (e.g. MXMGMT).',
          value: this.copyValue(item?.dynamicFormConfig, 'serviceId')
        }),
        new DynamicInputNetworkDbNetworkNameField({
          key: 'name',
          label: 'Network Name',
          placeholder: 'Enter a network name',
          validators: { required: true, maxlength: 255 },
          contextualHelp: 'Enter a name for this network.',
          networkItems: this.multiFormItems,
          value: ''
        }),
        new DynamicSelectNetworkDbUseCaseField({
          key: 'useCaseId',
          label: 'Use Case',
          validators: { required: true },
          contextualHelp: 'Select a use case for this network.',
          value: this.copyValue(item?.dynamicFormConfig, 'useCaseId')
        }),
        new DynamicInputTextField({
          key: 'description',
          label: 'Description',
          placeholder: 'Enter a description',
          validators: { maxlength: 1024 },
          contextualHelp: 'Optionally, enter a description for this network.'
        }),
        new DynamicSlideToggleField({
          key: `isMazaa`,
          header: 'VLAN Reservation',
          label: 'Is MAZ-AA',
          eventName: 'maz-aa-change',
          dependents: ['pods'],
          value: coerceBoolean(this.copyMazAaValue(item?.dynamicFormConfig, 'isMazaa'))
        }),
        new DynamicSelectPodsField({
          key: `pods`,
          label: 'PODS',
          placeholder: 'Select zero or more PODs',
          settings: { preserve: true },
          initialValue: this.copyPodsValue(item?.dynamicFormConfig, 'pods')
        })
      ]
    }));

  };

  public deleteItem(index: number, event?: PointerEvent): void {
    event?.stopPropagation();
    this.multiFormItems.splice(index, 1);
    this.multiFormItems?.forEach((item: McsMultiJobFormConfig) => {
      this._updateNetworkFormTitle(item);
    })
    this._podService.setNetworkItems(this.multiFormItems);
    this._podService.dispatchEvent();
  }

  public copyValue(dynamicFormConfig: DynamicFormFieldConfigBase[], key: string): any {
    if (isNullOrEmpty(dynamicFormConfig)) { return; }
    let foundValue = dynamicFormConfig.find((config) => config.key === key);
    return foundValue?.value;
  }

  public copyPodsValue(dynamicFormConfig: DynamicFormFieldConfigBase[], key: string): number[] {
    let podsValue: number[] = [];
    if (isNullOrEmpty(dynamicFormConfig)) { return; }
    let foundValue = dynamicFormConfig.find((config) => config.key === key);
    podsValue = foundValue?.value;
    return podsValue;
  }

  public copyMazAaValue(dynamicFormConfig: DynamicFormFieldConfigBase[], key: string): boolean {
    if (isNullOrEmpty(dynamicFormConfig)) { return; }
    let foundValue = dynamicFormConfig.find((config) => config.key === key);
    return isNullOrEmpty(foundValue?.value) ? false : true;
  }

  public onDataChange(item: McsMultiJobFormConfig): void {
    this._updateNetworkFormTitle(item);
    this._podService.setNetworkItems(this.multiFormItems);
  }

  private _updateNetworkFormTitle(updatedItem: McsMultiJobFormConfig): void {
    this.multiFormItems.map((formItem) =>{
      let itemFound = formItem.formTitle === updatedItem.formTitle;
      let itemIndex = this.multiFormItems.findIndex((formItem) => formItem.formTitle === updatedItem.formTitle);
      if (!itemFound) { return }
      formItem.dynamicFormConfig.map((formConfig) => {
        if (formConfig.key !== 'name') { return }
        formItem.formTitle = isNullOrEmpty(formConfig.value) ? `Network ${itemIndex + 1}` : formConfig.value;
      })
    })
  }
}