import {
  ProductType,
  WorkflowType
} from '@app/models';
import { dedicatedStorageIncreaseVolumeForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedStorageIncreaseVolumeWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedStorageIncreaseVolume,
    crispProductType: ProductType.PrimaryDedicatedStorage,
    title: 'Increase Dedicated Storage Volume',
    form: dedicatedStorageIncreaseVolumeForm
  };
}