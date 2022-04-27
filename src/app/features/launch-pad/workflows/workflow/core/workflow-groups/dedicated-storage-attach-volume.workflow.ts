import {
  ProductType,
  WorkflowType
} from '@app/models';
import { dedicatedStorageAttachVolumeForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedStorageAttachVolumeWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedStorageAttachVolume,
    crispProductType: ProductType.PrimaryDedicatedStorage,
    title: 'Attach Dedicated Storage Volume',
    form: dedicatedStorageAttachVolumeForm,
    label: 'Please ensure that your boot image is available to the specified blade and that any outstanding blade changes have been acknowledged via the UCS UI before running this workflow.'
  };
}