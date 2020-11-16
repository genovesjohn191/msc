import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CoreRoutes, McsNavigationService, McsStorageService } from '@app/core';
import { RouteKey } from '@app/models';
import { WorkflowGroupSaveState } from '../core';
import { workflowGroupIdText } from '../core/workflows/workflow-groups/workflow-group-type.enum';

@Component({
  selector: 'mcs-launch-pad-workflows.component',
  templateUrl: './launch-pad-workflows.component.html',
  styleUrls: ['./launch-pad-workflows.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowsComponent  {
  public get savedState(): WorkflowGroupSaveState[] {
    return this._storageService.getItem('workflows') ?? [];
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
      [state.companyId,state.targetSource,state.workflowGroupId,state.serviceId]);
  }

  public getWorkflowGroupId(workflowTypeId: number): string {
    return workflowGroupIdText[workflowTypeId];
  }
}

// TODO: Refactor and clean