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

import {McsErrorHandlerService } from '@app/core';
import {
  HttpStatusCode,
  ProductType
} from '@app/models';
import { McsApiService } from '@app/services';
import { isNullOrEmpty } from '@app/utilities';
import {
  LaunchPadComponent,
  LaunchPadContextSource,
  WorkflowGroupSaveState
} from '../core';
import { workflowGroupMap } from '../core/workflows/workflow-group.map';
import { WorkflowGroupId } from '../core/workflows/workflow-groups/workflow-group-type.enum';
import { WorkflowData } from '../core/workflows/workflow.interface';

export const errorSnackbarDuration: number = 30000;
export const sourceParam: string = 'source';
export const companyIdParam: string = 'companyid';
export const worklowGroupIdParam: string = 'workflowgroupid';
export const serviceIdParam: string = 'serviceid';
export const productIdParam: string = 'productid';

@Component({
  selector: 'mcs-launch-pad-workflow-launch.component',
  templateUrl: './launch-pad-workflow-launch.component.html',
  styleUrls: ['./launch-pad-workflow-launch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowLaunchComponent implements OnInit {
  @ViewChild('launchPad')
  protected launchPad: LaunchPadComponent;

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
          serviceId: params.get(serviceIdParam),
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
