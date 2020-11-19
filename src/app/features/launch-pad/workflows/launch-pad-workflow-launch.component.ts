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
import { throwError } from 'rxjs/internal/observable/throwError';
import {
  catchError,
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
  WorkflowGroupConfig,
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

    // TODO: This approach is for crisp-elements only
    this._apiService.getCrispElement(this.context.productId)
    .pipe(
      catchError(() => {
        this.processing = false;

        // This will load the form without preselected values
        this.context.config = {
          id: context.workflowGroupId,
          parent,
          children
        };

        this._snackBar.open('Unable to retrieve CRISP attributes.', 'OK', {
          duration: errorSnackbarDuration,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this._changeDetector.markForCheck();
        return throwError('Retrieving CRISP element failed.');
      }),
      takeUntil(this._destroySubject))
    .subscribe((response) => {
      // Sets the preselected values of the form
      parent.propertyOverrides = workflowGroup.parent.form.crispElementConverter(response.serviceAttributes);

      // TODO: Load the child overrides

      // Load the form
      this.context.config = {
        id: context.workflowGroupId,
        parent,
        children
      };

      this.processing = false;
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