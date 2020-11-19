import {
  Component,
  Inject
} from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA
} from '@angular/material/bottom-sheet';
import { MatListItem } from '@angular/material/list';

import { McsNavigationService } from '@app/core';
import {
  ProductType,
  RouteKey,
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadContextSource } from '../../workflows/workflow-group.interface';
import { workflowGroupMap } from '../../workflows/workflow-group.map';
import { WorkflowGroupId } from '../../workflows/workflow-groups/workflow-group-type.enum';
import { WorkflowService } from '../../workflows/workflow.service';
import {
  LaunchPadWorkflowSelectorService,
  WorkflowSelectorItem
} from './workflow-selector.service';

export interface WorkflowSelectorConfig {
  label: string;
  companyId: string;
  type: ProductType;
  source: LaunchPadContextSource;
  serviceId?: string;
  productId?: string;
}

@Component({
  selector: 'mcs-launch-pad-workflow-selector',
  templateUrl: 'workflow-selector.component.html'
})
export class LaunchPadWorkflowSelectorComponent {

  public options: WorkflowSelectorItem[] = [];

  public get supportedService(): boolean {
    return !isNullOrEmpty(this.options);
  }

  constructor(
    private _navigationService: McsNavigationService,
    private _workflowSelectorService: LaunchPadWorkflowSelectorService,
    private _workflowService: WorkflowService,
    private _bottomSheetRef: MatBottomSheetRef<LaunchPadWorkflowSelectorComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: WorkflowSelectorConfig
  ) {
    this._setOptions(data);
  }

  public showWorkflow(element: MatListItem): void {
    let id = WorkflowGroupId[element._getHostElement().dataset.id];
    let workflowGroupType = workflowGroupMap.get(id);
    if (isNullOrEmpty(workflowGroupType)) {
      console.log(`No workflow group found for ${id.toString()}`);
      return;
    }

    this._navigationService.navigateTo(
      RouteKey.LaunchPadWorkflowLaunch,
      [this.data.source, this.data.companyId, id, this.data.serviceId, this.data.productId]);

    this._bottomSheetRef.dismiss();
  }

  public getWorkflowGroupId(index: number): string {
    return WorkflowGroupId[index];
  }

  private _setOptions(data: WorkflowSelectorConfig): void {
    let workflowGroupIds: WorkflowGroupId[] = this._workflowService.getWorkflowGroupIdsByProductType(data.type);
    if (isNullOrEmpty(workflowGroupIds)) {
      return;
    }
    this.options = this._workflowSelectorService.getOptionsById(workflowGroupIds);
  }
}
