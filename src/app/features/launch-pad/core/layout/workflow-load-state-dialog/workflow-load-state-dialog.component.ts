import {
  Component,
  Inject,
  Input
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

import {
  WorkflowGroupSaveState,
  WorkflowGroupConfig
} from '../../workflows/workflow-group.interface';
import { Workflow } from '../../workflows/workflow.interface';

@Component({
  selector: 'mcs-workflow-load-state-dialog',
  templateUrl: './workflow-load-state-dialog.component.html',
})
export class LaunchPadLoadStateDialogComponent {
  @Input()
  public companyId: string = '556';

  public workflows: Workflow[];

  public config: WorkflowGroupConfig;

  public constructor(
    public dialogRef: MatDialogRef<LaunchPadLoadStateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkflowGroupSaveState
  ) {

    this.workflows = data.workflows;
  }
}
