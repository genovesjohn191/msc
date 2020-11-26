import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import {
  Guid,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { LaunchPadWorkflowComponent } from './workflow.component';
import { LaunchPadWorkflow } from '../../workflows/workflow';
import { WorkflowService } from '../../workflows/workflow.service';
import { WorkflowGroupDirective } from '../../workflows/workflow-group.directive';
import { Workflow, WorkflowData } from '../../workflows/workflow.interface';
import { WorkflowGroupConfig, WorkflowGroupSaveState } from '../../workflows/workflow-group.interface';
import { Subject, throwError } from 'rxjs';
import { McsApiService } from '@app/services';
import { McsObjectCrispElement } from '@app/models';
import { workflowGroupMap } from '../../workflows/workflow-group.map';
import { catchError, takeUntil } from 'rxjs/operators';
import { LaunchPadServiceIdSwitchDialogComponent } from '../service-id-switch-dialog/service-id-switch-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'mcs-launch-pad-workflow-group',
  templateUrl: './workflow-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowGroupComponent implements OnInit, OnDestroy {
  @ViewChild(WorkflowGroupDirective, {static: true})
  public workflowGroup: WorkflowGroupDirective;

  @Input()
  public set context(value: WorkflowGroupSaveState) {
    if (isNullOrEmpty(value)) { return; }
    this._context = value;

    this._loadWorkflow();
  }

  public get context(): WorkflowGroupSaveState {
    return this._context;
  }

  @Input()
  protected loadWorkflowNotifier: Subject<Workflow[]>;

  public get valid(): boolean {
    let validForm = true;
    let validServiceId: boolean = !isNullOrEmpty(this.context.serviceId);

    this.workflowComponentRef.forEach(ref => {
      if (ref.instance.included && !ref.instance.valid) {
        validForm = false;
      }
    });

    return validForm && validServiceId;
  }

  public get payload(): Workflow[] {
    let payloadItems: Workflow[] = [];
    this.workflowComponentRef.forEach(ref => {
      let payload = ref.instance.getRawValue();
      if (!isNullOrEmpty(payload)) {
        payloadItems.push(payload);
      }
    });

    return payloadItems;
  }

  public workflowComponentRef: ComponentRef<LaunchPadWorkflowComponent>[] = [];
  public componentRef: ComponentRef<any>;
  public ongoingServiceIdRetrieval: boolean = false;
  public hasServiceIdRetrievalError: boolean = false;
  private _context: WorkflowGroupSaveState;
  private _dialogSubject = new Subject<void>();

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _workflowService: WorkflowService,
    private _apiService: McsApiService,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar) { }

  public ngOnInit(): void {
    if (!isNullOrEmpty(this.loadWorkflowNotifier)) {
      this.loadWorkflowNotifier.subscribe((workflows) => this._loadWorkflowGroup(workflows));
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._dialogSubject);
  }

  public reset(): void {
    let parentReferenceId = Guid.newGuid().toString();

    this.workflowComponentRef.forEach(ref => {
      // Set new reference IDs
      if (isNullOrEmpty(ref.instance.parentReferenceId)) {
        ref.instance.referenceId = parentReferenceId;
      } else {
        ref.instance.referenceId = Guid.newGuid().toString();
        ref.instance.parentReferenceId = parentReferenceId;
      }

      ref.instance.reset();
    });
  }

  public switchObject(event: McsObjectCrispElement): void {
    const loadSaveStateDialogRef =
      this._dialog.open(LaunchPadServiceIdSwitchDialogComponent, { data: event.serviceId + ' [' + event.productId + ']' });

    loadSaveStateDialogRef.afterClosed()
    .pipe(takeUntil(this._dialogSubject))
    .subscribe(result => {
      if (result === true) {

        this.context.serviceId = event.serviceId;
        this.context.productId = event.productId;

        this._loadWorkflow();
        this._updateServiceId(this.context.serviceId);
        this._changeDetector.markForCheck();
      } else {

        this.context.serviceId = event.serviceId;
        this._updateServiceId(this.context.serviceId);
        this._changeDetector.markForCheck();
      }
    });
  }

  private _loadWorkflowGroup(workflows: Workflow[]): void {
    if (isNullOrEmpty(workflows)) {
      return;
    }

    // Load and edit each workflow
    let parentReferenceId: string = '';

    this.workflowComponentRef.forEach(ref => {
      // WARNING: Workflow - This will not handle similar types in a group
      let workflowIndex = workflows.findIndex((workflow) => workflow.type === ref.instance.type);

      let includeWorkflow = workflowIndex >= 0;
      if (!includeWorkflow) {
        ref.instance.referenceId = Guid.newGuid().toString();
        ref.instance.parentReferenceId = parentReferenceId;
        ref.instance.close();
        return;
      }

      // Set Service ID for the workflow group
      let isParentWorkflow = !isNullOrEmpty(workflows[workflowIndex].serviceId);
      if (isParentWorkflow) {
        parentReferenceId = workflows[workflowIndex].referenceId;
        this.context.serviceId = workflows[workflowIndex].serviceId;
      }

      // Load values to form
      ref.instance.load(workflows[workflowIndex]);
    });
  }

  private _loadWorkflow(): void {
    let workflowGroupType = workflowGroupMap.get(this.context.workflowGroupId);
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
        this._context.config = {
          id: this.context.workflowGroupId,
          parent,
          children
        };

        this._snackBar.open('Unable to retrieve CRISP attributes.', 'OK', {
          duration: 30000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        this._renderWorkflowGroup(this.context.config);
        this._changeDetector.markForCheck();

        return throwError('Retrieving CRISP element failed.');
      }))
    .subscribe((response) => {
      // Sets the preselected values of the form
      parent.propertyOverrides = workflowGroup.parent.form.crispElementConverter(this.context, response.serviceAttributes);

      // TODO: Load the child overrides

      // Load the form
      this._context.config = {
        id: this.context.workflowGroupId,
        parent,
        children
      };

      this._renderWorkflowGroup(this.context.config);

      this._changeDetector.markForCheck();
    });
  }

  private _updateServiceId(serviceId: string): void {
    this.workflowComponentRef.forEach(ref => {
      if (!isNullOrEmpty(ref.instance.serviceId)) {
        ref.instance.serviceId = serviceId;
      }
    });
  }

  private _renderWorkflowGroup(config: WorkflowGroupConfig): void {
    let workflows: LaunchPadWorkflow[] = this._workflowService.getWorkflowGroup(config);
    this.context.serviceId = config.parent.serviceId;

    // Clear references and instances of existing workflow
    this.workflowComponentRef = [];
    this.workflowGroup.viewContainerRef.clear();

    if (isNullOrEmpty(workflows)) {
      console.log('No workflow group found.');
      return;
    }
    // Render workflows
    workflows.forEach(workflow => {
      this._renderWorkflow(workflow);
    });
  }

  private _renderWorkflow(param: LaunchPadWorkflow): void {
    let componentFactory = this._componentFactoryResolver.resolveComponentFactory(LaunchPadWorkflowComponent);
    let componentRef = this.workflowGroup.viewContainerRef.createComponent<LaunchPadWorkflowComponent>(componentFactory);

    // Set workflow settings
    componentRef.instance.initialize(param);
    if (param.hasValueOverride) {
      componentRef.instance.open();
    }

    this.workflowComponentRef.push(componentRef);
  }
}
