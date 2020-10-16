import {
  Component,
  Input
} from '@angular/core';
import { Workflow } from '../../workflows/workflow.interface';

@Component({
  selector: 'mcs-launch-pad-workflow-provision-state',
  templateUrl: 'workflow-provision-state.component.html',
  styleUrls: [ './workflow-provision-state.component.scss' ]
})
export class LaunchPadWorkflowProvisionStateComponent {
  @Input()
  public workflows: Workflow[];
}
