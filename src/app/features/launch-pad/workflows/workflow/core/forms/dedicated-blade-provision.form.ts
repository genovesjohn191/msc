import {
  DynamicInputComputeField,
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicInputTextField,
  DynamicSelectField,
  DynamicSelectLunsField,
  DynamicSelectNetworkInterfaceField,
  DynamicSelectOsField,
  DynamicSelectResourceField,
  DynamicSelectPhysicalServerField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementService, McsObjectCrispElementServiceAttribute, PlatformType, ProductType } from '@app/models';
import { isNullOrEmpty, isNullOrUndefined } from '@app/utilities';
import { WorkflowGroupSaveState } from '../workflow-group.interface';
import { LaunchPadForm } from './form.interface';
import { CrispAttributeNames, findCrispElementAttribute } from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const dedicatedBladeProvisionCustomContextMapper: (context: WorkflowGroupSaveState) => { key: string, value: any }[] =
  (context: WorkflowGroupSaveState) => {

    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(context)) { return mappedProperties; }

    mappedProperties.push({ key: 'companyId', value: context.companyId });
    mappedProperties.push({ key: 'serviceId', value: context.serviceId });
    mappedProperties.push({ key: 'luns', value: context.productId });

    return mappedProperties;
  }

export const dedicatedBladeProvisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['resource', 'networks', 'serverId']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
      dependents: ['serverId']
    }),
    new DynamicSelectField({
      key: 'platform',
      label: 'Platform',
      options: [
        { key: 'ucs', value: 'UCS' }
      ],
      validators: { required: true }
    }),
    new DynamicSelectResourceField({
      key: 'resource',
      label: 'Resource',
      eventName: 'resource-change',
      dependents: ['networks', 'serverId', 'serverId'],
      validators: { required: true },
      settings: { preserve: true },
      includedPlatformTypes: [PlatformType.Dell, PlatformType.UcsCentral, PlatformType.UcsDomain]
    }),
    new DynamicSelectPhysicalServerField({
      key: 'serverId',
      label: 'Physical Server',
      eventName: 'physical-server-change',
      dependents: ['compute'],
      validators: { required: true }
    }),
    new DynamicInputTextField({
      key: 'name',
      label: 'Name',
      placeholder: 'Name',
      validators: { required: true }
    }),
    new DynamicInputComputeField({
      key: 'compute',
      eventName: 'compute-change',
      dependents: ['os'],
      label: 'compute',
      placeholder: 'compute'
    }),
    new DynamicSelectOsField({
      key: 'os',
      label: 'Operating System',
      eventName: 'os-change',
      dependents: ['networks'],
      isEsx: true,
      validators: { required: true }
    }),
    new DynamicSelectLunsField({
      key: 'luns',
      label: 'LUNS',
      validators: { required: true }
    }),
    new DynamicSelectNetworkInterfaceField({
      key: 'networks',
      label: 'Interface (eth0-eth1)',
      placeholder: 'Select networks',
      validators: { required: true }
    }),
  ],

  mapContext: dedicatedBladeProvisionCustomContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[], associatedServices?: McsObjectCrispElementService[]) => {

    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    return mappedProperties;
  }
}
