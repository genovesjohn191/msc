import {
  ProductType,
  WorkflowType
} from '@app/models';
import { microsoftReservationProvisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class MicrosoftReservationProvisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.MicrosoftReservationProvision,
    crispProductType: ProductType.AzureReservation,
    title: 'Provision Microsoft Reservation',
    form: microsoftReservationProvisionForm
  };
}