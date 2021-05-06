import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { Subject } from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';

import { McsErrorHandlerService } from '@app/core';
import {
  HttpStatusCode,
  ProductType
} from '@app/models';
import { McsApiService } from '@app/services';
import { isNullOrEmpty } from '@app/utilities';
import {
  LaunchPadWorkflowCoreComponent,
  LaunchPadContextSource,
  WorkflowGroupSaveState
} from './workflow';
import { workflowGroupMap } from './workflow/core/workflow-group.map';
import { WorkflowGroupId } from './workflow/core/workflow-groups/workflow-group-type.enum';
import { WorkflowData } from './workflow/core/workflow.interface';

export const errorSnackbarDuration: number = 30000;
export const sourceParam: string = 'source';
export const companyIdParam: string = 'companyid';
export const worklowGroupIdParam: string = 'workflowgroupid';
export const serviceIdParam: string = 'serviceid';
export const productIdParam: string = 'productid';

@Component({
  selector: 'mcs-launch-pad-workflow-launch.component',
  templateUrl: './workflow-launch.component.html',
  styleUrls: ['./workflow-launch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowLaunchComponent implements OnInit {
  @ViewChild('launchPad')
  protected launchPad: LaunchPadWorkflowCoreComponent;

  public context: WorkflowGroupSaveState;
  public workflowGroupId: WorkflowGroupId
  public productType: ProductType;
  public processing: boolean = false;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _changeDetector: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _errorHandlerService: McsErrorHandlerService) {}

  public ngOnInit(): void {
    this.getRouterParams();
  }

  private getRouterParams(): void {
    this.processing = true;

    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      tap((params: ParamMap) => {
        let workflowGroupIdParam = params.get(worklowGroupIdParam);
        let id: any = WorkflowGroupId[WorkflowGroupId[workflowGroupIdParam]];

        // Set LAUNCH pad context
        this.context = {
          source: params.get(sourceParam) as LaunchPadContextSource,
          workflowGroupId: id,
          companyId : params.get(companyIdParam),
          serviceId: params.get(serviceIdParam).toUpperCase(),
          productId: params.get(productIdParam)
        };

        let incompleteParameters =
          isNullOrEmpty(this.context.source)
          || isNullOrEmpty(workflowGroupMap.get(id))
          || isNullOrEmpty(this.context.companyId)
          || isNullOrEmpty(this.context.productId);

        if (incompleteParameters) {
          this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound);
          return;
        }

        // Set LAUNCH pad config
        this._loadWorkflow(this.context);
      })
    ).subscribe();
  }

  private _loadWorkflow(context: WorkflowGroupSaveState): void {
    let workflowGroupType = workflowGroupMap.get(context.workflowGroupId);
    let workflowGroup = new workflowGroupType();

    let parent: WorkflowData = {
      id: workflowGroup.parent.id,
      serviceId: this.context.serviceId,
      propertyOverrides: [],
    };
    let children: WorkflowData[] = [];

    this.context.config = {
      id: context.workflowGroupId,
      parent,
      children
    };

    this.processing = false;
    this._changeDetector.markForCheck();
  }
}
