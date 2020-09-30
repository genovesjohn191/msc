import { provisionAvForm } from '../forms';
import {
  WorkflowGroup,
  WorkflowSettings
} from '../workflow-group.interface';
import { LaunchPadWorkflowGroupType } from '../workflow-selector.service';

export class ProvisionAvWorkflowGroup implements WorkflowGroup {
  public type: LaunchPadWorkflowGroupType = 'provision-av';

  public parent: WorkflowSettings = {
    type: 'servers.av',
    title: 'Provision Anti Virus',
    properties: provisionAvForm
  };

  public children: WorkflowSettings[] = [];
}
