import { ProductType, WorkflowType } from '@app/models';
import { dedicatedStorageAttachVolumeForm } from '../forms/dedicated-storage-attach-volume.form';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedStorageAttachVolumeWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedStorageAttachVolume,
    crispProductType: ProductType.PrimaryDedicatedStorage,
    title: 'Attach Dedicated Storage Volume',
    form: dedicatedStorageAttachVolumeForm
  };
}