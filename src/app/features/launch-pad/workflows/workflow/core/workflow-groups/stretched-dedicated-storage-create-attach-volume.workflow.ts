import {
  ProductType,
  WorkflowType
} from '@app/models';
import { dedicatedStorageCreateAndAttachVolumeForm, stretchedDedicatedStorageCreateAndAttachVolumeForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class StretchedDedicatedStorageCreateAndAttachVolumeWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.StretchedDedicatedStorageCreateAttachVolume,
    crispProductType: ProductType.StretchedDedicatedStorage,
    title: 'Create And Attach Dedicated Storage Volume',
    form: stretchedDedicatedStorageCreateAndAttachVolumeForm,
    label: 'Please ensure that your boot image is available to the specified blade and that any outstanding blade changes have been acknowledged via the UCS UI before running this workflow.'
  };
}