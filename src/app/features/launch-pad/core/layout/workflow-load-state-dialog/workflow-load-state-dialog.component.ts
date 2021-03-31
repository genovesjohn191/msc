import {
  Component,
  Inject
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

import { WorkflowGroupSaveState } from '../../workflows/workflow-group.interface';
import { workflowGroupIdText } from '../../workflows/workflow-groups/workflow-group-type.enum';
import { Workflow } from '../../workflows/workflow.interface';

@Component({
  selector: 'mcs-workflow-load-state-dialog',
  templateUrl: './workflow-load-state-dialog.component.html',
})
export class LaunchPadLoadStateDialogComponent {
  public workflows: Workflow[];
  public workflowType: string;

  public constructor(
    public dialogRef: MatDialogRef<LaunchPadLoadStateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkflowGroupSaveState
  ) {
    this.workflowType = workflowGroupIdText[data.workflowGroupId];
    this.workflows = data.workflows;
  }
}
