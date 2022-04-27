import {
  ProductType,
  WorkflowType
} from '@app/models';
import { dedicatedStorageCreateAndAttachVolumeForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedStorageCreateAndAttachVolumeWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedStorageCreateAttachVolume,
    crispProductType: ProductType.PrimaryDedicatedStorage,
    title: 'Create And Attach Dedicated Storage Volume',
    form: dedicatedStorageCreateAndAttachVolumeForm,
    label: 'Please ensure that your boot image is available to the specified blade and that any outstanding blade changes have been acknowledged via the UCS UI before running this workflow.'
  };
}