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
import { ProductType } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import {
  LaunchPadWorkflowSelectorService,
  WorkflowSelectorItem
} from './workflow-selector.service';
import { WorkflowGroupId } from '../workflows/workflow-groups/workflow-group-type.enum';
import { WorkflowService } from '../workflows/workflow.service';

export interface WorkflowSelectorConfig {
  type: ProductType;
  label: string;
  serviceId?: string;
  parentServiceId?: string;
  properties?: { key: string, value: any }[];
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
    let id: WorkflowGroupId = WorkflowGroupId[element._getHostElement().dataset.id];
    this._eventDispatcher.dispatch(McsEvent.launchPadWorkflowInitEvent, {
      id,
      serviceId: this.data.serviceId,
      parentServiceId: this.data.parentServiceId,
      properties: this.data.properties
    });
    this._bottomSheetRef.dismiss();
  }

  public getWorkflowGroupId(index: number): string {
    return WorkflowGroupId[index];
  }

  private _setOptions(data: WorkflowSelectorConfig): void {
    let workflowGroupIds = this._workflowService.getWorkflowGroupIdsByProductType(data.type);
    if (isNullOrEmpty(workflowGroupIds)) {
      return;
    }
    this.options = this._workflowSelectorService.getOptionsById(workflowGroupIds);
  }
}
