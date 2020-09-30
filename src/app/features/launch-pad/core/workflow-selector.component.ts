import { Component, Inject } from '@angular/core';
import {
  MatBottomSheetRef,
  MatListItem,
  MAT_BOTTOM_SHEET_DATA
} from '@angular/material';
import { McsEvent } from '@app/events';
import { isNullOrEmpty } from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  LaunchPadWorkflowSelectorService,
  WorkflowSelectorConfig,
  WorkflowSelectorItem
} from './workflow-selector.service';

@Component({
  selector: 'mcs-launch-pad-workflow-selector',
  templateUrl: 'workflow-selector.component.html'
})
export class LaunchPadWorkflowSelectorComponent {

  public items: WorkflowSelectorItem[] = [];

  private config: WorkflowSelectorConfig;

  constructor(
    private _workflowSelectorService: LaunchPadWorkflowSelectorService,
    private _bottomSheetRef: MatBottomSheetRef<LaunchPadWorkflowSelectorComponent>,
    private _eventDispatcher: EventBusDispatcherService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: WorkflowSelectorConfig
  ) {
    this.config = data;
    this.setOptions(data);
  }

  public openLink(event: MatListItem): void {
    let type: any = event._getHostElement().dataset.type;
    this._eventDispatcher.dispatch(McsEvent.launchPadWorkflowInitEvent, {
      type,
      serviceId: this.data.serviceId,
      parentServiceId: this.data.parentServiceId,
      properties: this.data.properties
    });
    this._bottomSheetRef.dismiss();
  }

  private setOptions(data: WorkflowSelectorConfig): void {
    this.items = [];

    let workflowGroups = this._workflowSelectorService.workflowSelectionGroups.get(data.type);
    if (isNullOrEmpty(workflowGroups)) {
      return;
    }

    workflowGroups.forEach(workflowGroup => {
      let item = this._workflowSelectorService.workflowSelectionGroupItems.get(workflowGroup);
      if (!isNullOrEmpty(item)) {
        this.items.push(item);
      }
    });
  }
}
