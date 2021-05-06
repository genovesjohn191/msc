import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CoreRoutes, McsNavigationService, McsStorageService } from '@app/core';
import { RouteKey } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { WorkflowGroupSaveState } from './workflow';
import { workflowGroupIdText } from './workflow/core/workflow-groups/workflow-group-type.enum';

@Component({
  selector: 'mcs-launch-pad-workflows.component',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowsComponent  {
  public get hasDrafts(): boolean {
    return !isNullOrEmpty(this.savedState);
  }

  public get savedState(): WorkflowGroupSaveState[] {
    let saveStateId = 'workflows';
    let currentStates: WorkflowGroupSaveState[] = this._storageService.getItem(saveStateId) ?? [];

    // Remove invalid states
    let validStates =  currentStates.filter((state) =>
      !isNullOrEmpty(this.getWorkflowGroupId(state.workflowGroupId))
      && !isNullOrEmpty(state.companyId)
      && state.companyId !== '0'
      && !isNullOrEmpty(state.productId)
      && !isNullOrEmpty(state.serviceId));

    this._storageService.setItem(saveStateId, validStates);

    return validStates;
  }

  public get workflowLaunchLink(): string {
    return CoreRoutes.getNavigationPath(RouteKey.LaunchPadWorkflowLaunch);
  }

  public constructor(
    private _navigationService: McsNavigationService,
    private _storageService: McsStorageService
  ) { }

  public onClick(state: WorkflowGroupSaveState): void {
    this._navigationService.navigateTo(
      RouteKey.LaunchPadWorkflowLaunch,
      [state.source, state.companyId, state.workflowGroupId.toString(), state.serviceId, state.productId]);
  }

  public getWorkflowGroupId(workflowTypeId: number): string {
    return workflowGroupIdText[workflowTypeId];
  }
}
