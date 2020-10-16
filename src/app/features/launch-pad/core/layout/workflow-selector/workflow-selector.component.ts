import {
  Component,
  Inject
} from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA
} from '@angular/material/bottom-sheet';
import { MatListItem } from '@angular/material/list';

import { McsEvent } from '@app/events';
import {
  ProductType,
  WorkflowType
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { workflowGroupMap } from '../../workflows/workflow-group.map';
import { WorkflowGroupId } from '../../workflows/workflow-groups/workflow-group-type.enum';
import { WorkflowData } from '../../workflows/workflow.interface';
import { WorkflowService } from '../../workflows/workflow.service';
import {
  LaunchPadWorkflowSelectorService,
  WorkflowSelectorItem
} from './workflow-selector.service';

export interface WorkflowSelectorConfig {
  label: string;
  type?: ProductType;
  serviceId?: string;
  properties?: { key: string, value: any }[];
  children?: WorkflowSelectorConfig[];
}

@Component({
  selector: 'mcs-launch-pad-workflow-selector',
  templateUrl: 'workflow-selector.component.html'
})
export class LaunchPadWorkflowSelectorComponent {

  public options: WorkflowSelectorItem[] = [];

  constructor(
    private _workflowSelectorService: LaunchPadWorkflowSelectorService,
    private _workflowService: WorkflowService,
    private _bottomSheetRef: MatBottomSheetRef<LaunchPadWorkflowSelectorComponent>,
    private _eventDispatcher: EventBusDispatcherService,
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

    // Create parent workflow
    let workflowGroup = new workflowGroupType();
    let parentWorkflowType: WorkflowType = workflowGroup.parent.id;

    if (isNullOrEmpty(parentWorkflowType)) {
      // This will cause the workflow to not load at all
      console.log(`No mapping found for ${this.data.type.toString()}`);
      return;
    }

    let parent: WorkflowData = {
      id: parentWorkflowType,
      serviceId: this.data.serviceId,
      propertyOverrides: this.data.properties
    };

    // Create child workflows
    let children: WorkflowData[] = [];
    if (!isNullOrEmpty(this.data.children)) {
      this.data.children.forEach((child) => {
        let notAService = isNullOrEmpty(child.type);
        if (notAService) {
          return;
        }

        // Check child workflows of workflow group if product type has a match
        let result = workflowGroup.children.find((childWorkflow) => childWorkflow.productType === child.type);
        let noWorkflowEquivalent = isNullOrEmpty(result);
        if (noWorkflowEquivalent) {
          return;
        }

        let childWorkflowType = workflowGroup.children.find((childWorkflow) => childWorkflow.productType === child.type).id;

        if (isNullOrEmpty(childWorkflowType)) {
          console.log(`No mapping found for ${child.type.toString()}`);
          return;
        }
        children.push({
          id: childWorkflowType,
          serviceId: child.serviceId,
          propertyOverrides: child.properties
        });
      });
    }

    this._eventDispatcher.dispatch(McsEvent.launchPadWorkflowInitEvent, {
      id,
      parent,
      children
    });

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
