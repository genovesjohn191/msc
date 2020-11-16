import { Component, ChangeDetectionStrategy, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ProductType, WorkflowType } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { LaunchPadComponent, LaunchPadContext, WorkflowGroup, WorkflowGroupConfig } from '../core';
import { workflowGroupMap } from '../core/workflows/workflow-group.map';
import { WorkflowGroupId } from '../core/workflows/workflow-groups/workflow-group-type.enum';
import { WorkflowData } from '../core/workflows/workflow.interface';

interface ItemX {
  type: ProductType;
  properties: { key: string, value: any }[];
  children?: ItemX[];
}

@Component({
  selector: 'mcs-launch-pad-workflow-launch.component',
  templateUrl: './launch-pad-workflow-launch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowLaunchComponent implements OnInit {
  @ViewChild('launchPad')
  protected launchPad: LaunchPadComponent;

  public launchPadContext: LaunchPadContext;
  public config: WorkflowGroupConfig;
  public workflowGroupId: WorkflowGroupId
  public productType: ProductType;

  private _destroySubject = new Subject<void>();

  public constructor(private _activatedRoute: ActivatedRoute) {}

  public ngOnInit(): void {
    this.getRouterParams();
  }

  private getRouterParams(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      tap((params: ParamMap) => {
        let companyId = params.get('companyid');
        let workflowGroupIdParam = params.get('workflowgroupid');
        let targetSource = params.get('system');

        let id: any = WorkflowGroupId[WorkflowGroupId[workflowGroupIdParam]];
        let workflowGroupType = workflowGroupMap.get(id);

        let hasRequiredParameters =
          !isNullOrEmpty(workflowGroupType)
          && !isNullOrEmpty(companyId)
          && !isNullOrEmpty(targetSource);

        if (!hasRequiredParameters) {
          console.log(`No workflow group found for ${id.toString()}`);
          return;
        }

        let serviceId = params.get('serviceid');

        // Set LAUNCH pad context
        this.launchPadContext = {
          companyId,
          targetSource,
          serviceId
        };

        // Set LAUNCH pad config
        this._loadConfig(id, serviceId);
      })
    ).subscribe();
  }

  private _loadConfig(workflowGroupId: WorkflowGroupId, serviceId: string): void {
    let workflowGroupType = workflowGroupMap.get(workflowGroupId);
    let workflowGroup = new workflowGroupType();

    // Create parent workflow
    let parentWorkflowType: WorkflowType = workflowGroup.parent.id;

    if (isNullOrEmpty(parentWorkflowType)) {
      // This will cause the workflow to not load at all
      console.log(`No mapping found for ${workflowGroup.toString()}`);
      return;
    }

    // TODO: Get payload overrides, retrieve based on service ID, add mapping of payload
    let item: ItemX = {
      type: workflowGroup.parent.productType,
      properties: [],
      children: []
    }

    let parent: WorkflowData = {
      id: parentWorkflowType,
      serviceId,
      propertyOverrides: item.properties
    };

    // Create child workflows
    let children: WorkflowData[] = [];
    if (!isNullOrEmpty(item.children)) {
      item.children.forEach((child) => {
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
          propertyOverrides: child.properties
        });
      });
    }

    this.config = {
      id: workflowGroupId,
      parent,
      children
    }
  }
}
