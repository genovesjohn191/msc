import { ProductType, WorkflowType } from '@app/models';
import { dedicatedStorageUnmaskVolumeForm } from '../forms/dedicated-storage-unmask-volume.form';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedStorageUnmaskVolumeWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedStorageUmaskVolume,
    crispProductType: ProductType.PrimaryDedicatedStorage,
    title: 'Unmask Dedicated Storage Volume',
    form: dedicatedStorageUnmaskVolumeForm
  };
}