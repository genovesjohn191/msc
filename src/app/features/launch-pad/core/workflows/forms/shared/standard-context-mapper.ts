import { isNullOrEmpty } from '@app/utilities';
import { WorkflowGroupSaveState } from '../../workflow-group.interface';

export const standardContextMapper: (context: WorkflowGroupSaveState) => { key: string, value: any }[] =
  (context: WorkflowGroupSaveState) => {

    let mappedProperties: { key: string, value: any }[] = [];
  if (isNullOrEmpty(context)) { return mappedProperties; }

  mappedProperties.push({ key: 'companyId', value: context.companyId });
  mappedProperties.push({ key: 'serviceId', value: context.serviceId });

  return mappedProperties;
}