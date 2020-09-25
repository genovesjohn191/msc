import { Component, Inject } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA
} from '@angular/material';
import { ProductType } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import {
  LaunchPadWorkflowSelectorService,
  WorkflowSelectorItem
} from './workflow-selector.service';

export interface WorkflowSelectorConfig {
  type: ProductType;
}

@Component({
  selector: 'mcs-launch-pad-workflow-selector',
  templateUrl: 'workflow-selector.component.html'
})
export class LaunchPadWorkflowSelectorComponent {

  public items: WorkflowSelectorItem[] = [];

  constructor(
    private _workflowSelectorService: LaunchPadWorkflowSelectorService,
    private _bottomSheetRef: MatBottomSheetRef<LaunchPadWorkflowSelectorComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: WorkflowSelectorConfig
  ) {
    this.setOptions(data);
  }

  public openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  private setOptions(data: WorkflowSelectorConfig): void {
    this.items = [];

    let workflowGroups = this._workflowSelectorService.productWorkflowGroups.get(ProductType.VmBackup);
    if (isNullOrEmpty(workflowGroups)) {
      return;
    }
    workflowGroups.forEach(workflowGroup => {
      let item = this._workflowSelectorService.workflowGroupSelectItems.get(workflowGroup);
      if (!isNullOrEmpty(item)) {
        this.items.push(item);
      }
    });
  }
}
