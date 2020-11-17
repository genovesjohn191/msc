// import { Component, ChangeDetectionStrategy, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { Component, ChangeDetectionStrategy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ProductType, WorkflowType } from '@app/models';
import { McsApiService } from '@app/services';
import { isNullOrEmpty } from '@app/utilities';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { LaunchPadComponent, LaunchPadContext, LaunchPadContextSource, WorkflowGroupConfig } from '../core';
import { workflowGroupMap } from '../core/workflows/workflow-group.map';
import { WorkflowGroupId } from '../core/workflows/workflow-groups/workflow-group-type.enum';
import { WorkflowData } from '../core/workflows/workflow.interface';

export const sourceParam: string = 'source';
export const companyIdParam: string = 'companyid';
export const worklowGroupIdParam: string = 'workflowgroupid';
export const serviceIdParam: string = 'serviceid';
export const productIdParam: string = 'productid';

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

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _changeDetector: ChangeDetectorRef) {}

  public ngOnInit(): void {
    this.getRouterParams();
  }

  private getRouterParams(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      tap((params: ParamMap) => {
        let workflowGroupIdParam = params.get(worklowGroupIdParam);
        let id: any = WorkflowGroupId[WorkflowGroupId[workflowGroupIdParam]];

        // Set LAUNCH pad context
        this.launchPadContext = {
          source: params.get(sourceParam) as LaunchPadContextSource,
          workflowGroupId: id,
          companyId : params.get(companyIdParam),
          serviceId: params.get(serviceIdParam),
          productId: params.get(productIdParam)
        };

        let incompleteParameters =
          isNullOrEmpty(this.launchPadContext.source)
          || isNullOrEmpty(workflowGroupMap.get(id))
          || isNullOrEmpty(this.launchPadContext.companyId)
          || isNullOrEmpty(this.launchPadContext.productId);

        if (incompleteParameters) {
          console.log(`No workflow group found for ${id.toString()}`);
          return;
        }

        // Set LAUNCH pad config
        this._loadWorkflow(this.launchPadContext);
      })
    ).subscribe();
  }

  private _loadWorkflow(context: LaunchPadContext): void {
    let workflowGroupType = workflowGroupMap.get(context.workflowGroupId);
    let workflowGroup = new workflowGroupType();

    if (isNullOrEmpty(workflowGroup.parent.id)) {
      // This will cause the workflow to not load at all
      console.log(`No mapping found for ${workflowGroup.toString()}`);
      return;
    }

    // TODO: This approach is for crisp-elements only
    this._apiService.getCrispElement(this.launchPadContext.productId)
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        let parent: WorkflowData = {
          id: workflowGroup.parent.id,
          serviceId: this.launchPadContext.serviceId,
          propertyOverrides: workflowGroup.parent.form.crispElementConverter(response.serviceAttributes),
        };

        // Create child workflows
        let children: WorkflowData[] = [];
        // TODO: Map children payload to form

        // This will now trigger LAUNCH pad loading
        this.config = {
          id: context.workflowGroupId,
          parent,
          children
        };

        this._changeDetector.markForCheck();
      });
  }
}

// let children: WorkflowData[] = [];
// if (!isNullOrEmpty(item.children)) {
//   item.children.forEach((child) => {
//     let notAService = isNullOrEmpty(child.type);
//     if (notAService) {
//       return;
//     }

//     // Check child workflows of workflow group if product type has a match
//     let result = workflowGroup.children.find((childWorkflow) => childWorkflow.productType === child.type);
//     let noWorkflowEquivalent = isNullOrEmpty(result);
//     if (noWorkflowEquivalent) {
//       return;
//     }

//     let childWorkflowType = workflowGroup.children.find((childWorkflow) => childWorkflow.productType === child.type).id;

//     if (isNullOrEmpty(childWorkflowType)) {
//       console.log(`No mapping found for ${child.type.toString()}`);
//       return;
//     }

//     children.push({
//       id: childWorkflowType,
//       propertyOverrides: child.properties
//     });
//   });
// }