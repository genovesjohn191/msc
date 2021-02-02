import { ProductType, WorkflowType } from '@app/models';
import { dedicatedStorageCreateAndAttachVolumeForm } from '../forms/dedicated-storage-create-attach-volume.form';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedStorageCreateAndAttachVolumeWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedStorageCreateAttachVolume,
    crispProductType: ProductType.PrimaryDedicatedStorage,
    title: 'Create And Attach Dedicated Storage Volume',
    form: dedicatedStorageCreateAndAttachVolumeForm
  };
}