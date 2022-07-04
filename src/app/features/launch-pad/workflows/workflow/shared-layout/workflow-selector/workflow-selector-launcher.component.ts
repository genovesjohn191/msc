import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { isNullOrEmpty } from '@app/utilities';
import { productWorkflowGroupMap } from '../../core/product-workflow-group.map';
import { WorkflowGroupId } from '../../core/workflow-groups/workflow-group-type.enum';
import {
  LaunchPadWorkflowSelectorComponent,
  WorkflowSelectorConfig
} from './workflow-selector.component';
import { LaunchPadWorkflowSelectorService } from './workflow-selector.service';

@Component({
  selector: 'mcs-workflow-selector-launcher',
  templateUrl: 'workflow-selector-launcher.component.html'
})
export class WorkflowSelectorLauncherComponent {

  @Input()
  public config: WorkflowSelectorConfig;

  @Output()
  public selected: EventEmitter<WorkflowSelectorConfig>;

  public get hasWorkflows(): boolean {
    let workflowGroups = productWorkflowGroupMap.get(this.config?.type);
    if (isNullOrEmpty(workflowGroups)) { return; }
    let allowedWorkflowGroupIdsBasedOnStatus: WorkflowGroupId[] = 
      this._workflowSelectorService.getWorkflowGroupIdsBasedOnAllowedStatus(this.config, workflowGroups);
    return !isNullOrEmpty(allowedWorkflowGroupIdsBasedOnStatus);
  }

  public constructor(
    private _bottomSheet: MatBottomSheet,
    private _workflowSelectorService: LaunchPadWorkflowSelectorService) {
    this.selected = new EventEmitter();
  }

  public onClick(): void {
    this._bottomSheet.open(LaunchPadWorkflowSelectorComponent, { data: this.config });
  }
}
