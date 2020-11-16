import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatVerticalStepper } from '@angular/material/stepper';
import {
  IMcsNavigateAwayGuard,
  McsStorageService
} from '@app/core';
import {
  cloneDeep,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import { LaunchPadWorkflowGroupComponent } from './layout/workflow-group/workflow-group.component';
import { LaunchPadLoadStateDialogComponent } from './layout/workflow-load-state-dialog/workflow-load-state-dialog.component';
import {
  WorkflowGroupConfig,
  WorkflowGroupSaveState
} from './workflows/workflow-group.interface';
import { WorkflowGroupId } from './workflows/workflow-groups/workflow-group-type.enum';
import { Workflow } from './workflows/workflow.interface';
import { McsApiService } from '@app/services';
import { McsJob, McsWorkflowCreate } from '@app/models';

enum WizardStep  {
  EditWorkflowGroup = 0,
  ConfirmDetails = 1,
  ProvisionWorkflows = 2
}

export interface LaunchPadContext {
  companyId: string;
  targetSource: string;
  serviceId: string;
}

// TODO: This can be moved to global location
const standardSnackbarDurationInMs = 4000;
const removeWorkflowsSnackbarDurationInMs = 6000;

@Component({
  selector: 'mcs-launch-pad',
  templateUrl: './launch-pad-core.component.html',
  styleUrls: ['./launch-pad-core.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadComponent implements OnDestroy, IMcsNavigateAwayGuard {
  @ViewChild('stepper')
  protected stepper: MatVerticalStepper;

  @ViewChild('workflowGroup')
  protected workflowGroup: LaunchPadWorkflowGroupComponent;

  @Input()
  public context: LaunchPadContext;

  @Input()
  public set config(value: WorkflowGroupConfig) {
    if (isNullOrEmpty(value)) {
      return;
    }

    this._initializeWorkflowProcess();
    this._config = value;
    this._tryLoadSavedState();
  }

  public get config(): WorkflowGroupConfig {
    return this._config;
  }

  public get saveStateKey(): string {
    return `workflows`;
  }

  public get savedState(): WorkflowGroupSaveState[] {
    return this._storageService.getItem(this.saveStateKey) ?? [];
  }

  public set savedState(value: WorkflowGroupSaveState[]) {
    if (isNullOrEmpty(value)) {
      this._storageService.removeItem(this.saveStateKey);
    } else {
      this._storageService.setItem(this.saveStateKey, value);
    }
  }

  public get validForProvisioning(): boolean {
    return !isNullOrEmpty(this.workflows);
  }

  public get valid(): boolean {
    if (isNullOrEmpty(this.workflowGroup)) {
      return false;
    }
    return this.workflowGroup.valid;
  }

  public workflows: Workflow[] = [];
  public workflowsState: McsJob[] = [];
  public isNewWorkflowGroup: boolean = true;
  public isEditing: boolean = false;
  public isProvisioning: boolean = false;
  public editWorkflowGroup = new Subject<Workflow[]>();
  public newlyAddedWorkflowIds: string[] = [];
  public hasError: boolean = false;
  public processing: boolean = false;

  private _config: WorkflowGroupConfig;
  private _deletedWorkflows: Workflow[] = [];
  private _deleteWorkflowSubject = new Subject<void>();
  private _dialogSubject = new Subject<void>();

  public constructor(
    private _dialog: MatDialog,
    private _storageService: McsStorageService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _apiService: McsApiService
  ) { }

  public canNavigateAway(): boolean {
    return isNullOrEmpty(this.workflows);
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.editWorkflowGroup);
    unsubscribeSafely(this._deleteWorkflowSubject);
    unsubscribeSafely(this._dialogSubject);
  }

  public addOrUpdate(): void {
    if (!this.workflowGroup.valid) { return; }

    this._saveWorkflowGroup(this.workflowGroup.payload);
    this._saveState();
    console.log(JSON.stringify(this.workflows));
  }

  public addAnother(): void {
    this._resetForm();
    this._gotoStep(WizardStep.EditWorkflowGroup);
  }

  public editWorkflow(referenceId: string): void {
    this.isNewWorkflowGroup = false;
    let workflows = this._getWorkflowGroupByReferenceId(referenceId);
    this.editWorkflowGroup.next(workflows);

    this._gotoStep(WizardStep.EditWorkflowGroup);
  }

  public cancelEditing(): void {
    this._resetForm();
    this._gotoStep(WizardStep.ConfirmDetails);
  }

  public remove(referenceId: string): void {
    let workflow = this._getWorkflowByReferenceId(referenceId);
    let workflowNotFound = isNullOrEmpty(workflow);
    if (workflowNotFound) { return; }

    this._removeWorkflowGroup(referenceId, true);
    this._resetForm();
    if (!this.validForProvisioning) {
      this._initializeWorkflowProcess();
    }

    this._saveState();

    this._showWorkflowRemovalNotification(workflow.title);
  }

  public runWorkflow(): void {
    this.hasError = false;
    this.processing = true;

    let payload: McsWorkflowCreate[] = this.workflows.map((workflow) => ({
      type: workflow.type,
      referenceId: workflow.referenceId,
      parentReferenceId: workflow.parentReferenceId,
      serviceId: workflow.serviceId,
      properties: workflow.properties
    }));
    this._gotoStep(WizardStep.ProvisionWorkflows);

    // this._apiService.provisionWorkflows(payload)
    // .pipe(catchError(() => {
    //   this.hasError = true;
    //   this.processing = false;
    //   this._changeDetectorRef.markForCheck();
    //   return throwError('Workflow provision endpoint failed.');
    // }))
    // .subscribe((response) => {
    //   // Pass ongoing jobs to provisioning component
    //   this.workflowsState = response.collection;

    //   // Go to provisioning step
    //   this._gotoStep(WizardStep.ProvisionWorkflows);

    //   // Remove saved state
    //   // this.savedState = null;

    //   this._changeDetectorRef.markForCheck();
    // });
  }

  public retryProvision(): void {
    this.hasError = false;
    this.processing = false;
    this._changeDetectorRef.markForCheck();
  }

  public isNew(referenceId: string): boolean {
    return !isNullOrEmpty(this.newlyAddedWorkflowIds.find((ref) => ref === referenceId));
  }

  public clone(workflow: Workflow): any {
    return cloneDeep(workflow.properties);
  }

  private _initializeWorkflowProcess(workflows: Workflow[] = []): void {
    this.workflows = workflows;
    if (this.stepper) {
      this.isNewWorkflowGroup = true;
      this.isEditing = false;
      this.isProvisioning = false;
      this.stepper.reset();
    }
  }

  private _gotoStep(step: WizardStep): void {
    switch (step) {
      case WizardStep.EditWorkflowGroup: {
        this.isEditing = this.validForProvisioning;
        this.stepper.previous();
        break;
      }

      case WizardStep.ConfirmDetails: {
        if (this.validForProvisioning) {
          this.isEditing = false;
          this.stepper.next();
        }
        break;
      }

      case WizardStep.ProvisionWorkflows: {
        if (this.validForProvisioning) {
          this.isProvisioning = true;
          this.stepper.selected.completed = true;
          this.stepper.next();
        }
        break;
      }
    }
  }

  private _saveWorkflowGroup(workflowGroup: Workflow[]): void {
    if (isNullOrEmpty(workflowGroup)) {
      return;
    }
    let existingWorkflow = false;
    this.newlyAddedWorkflowIds = [];

    // Get parent info
    let parentWorkflow: Workflow = workflowGroup.find((item) => !isNullOrEmpty(item.serviceId));
    let parentWorkflowIndex: number =
      isNullOrEmpty(this.workflows)
      ? -1
      : this.workflows.findIndex((item) => item.referenceId === parentWorkflow.referenceId);

    if (parentWorkflowIndex < 0) {
      // Add parent
      this.workflows.push(parentWorkflow);
      parentWorkflowIndex = this.workflows.length - 1;
    } else {
      // Update parent
      existingWorkflow = true;
      this.workflows[parentWorkflowIndex] = parentWorkflow;
    }
    this.newlyAddedWorkflowIds.push(parentWorkflow.referenceId);

    // Delete existing child workflows
    this._removeChildWorkflows(parentWorkflow.referenceId);
    // Recreate child workflows
    let childWorkflows: Workflow[] = workflowGroup.filter((item) => item.parentReferenceId === parentWorkflow.referenceId);
    this._addChildWorkflows(parentWorkflowIndex, childWorkflows);

    // Navigate to confirm step
    this._resetForm();
    this._markFirstStepAsComplete();

    this._showWorkflowsUpdateNotification(parentWorkflow.title, parentWorkflow.serviceId, existingWorkflow);
  }

  private _addChildWorkflows(parentIndex: number, workflows: Workflow[]): void {
    let ctr = 0;
    let isLastParent = parentIndex === this.workflows.length - 1;

    workflows.forEach((child) => {
      this.newlyAddedWorkflowIds.push(child.referenceId);
      if (isLastParent) {
        this.workflows.push(child);
      } else {
        this.workflows.splice(parentIndex + 1 + ctr++, 0, child);
      }
    });
  }

  private _markFirstStepAsComplete(): void {
    if (this.stepper.selectedIndex === WizardStep.EditWorkflowGroup) {
      this.stepper.selected.completed = true;
      this._gotoStep(WizardStep.ConfirmDetails);
    }
  }

  private _getWorkflowGroupByReferenceId(referenceId: string): Workflow[] {
    let parentWorkflow = this._getWorkflowByReferenceId(referenceId);
    let workflows = this._getChildWorkflowsByParentReferenceId(referenceId);
    workflows.splice(0, 0, parentWorkflow);

    return workflows;
  }

  private _getWorkflowByReferenceId(referenceId: string): Workflow {
    return this.workflows.find((workflow) => workflow.referenceId === referenceId);
  }

  private _getChildWorkflowsByParentReferenceId(parentReferenceId: string): Workflow[] {
    return this.workflows.filter(payload => payload.parentReferenceId === parentReferenceId);
  }

  private _resetForm(): void {
    this.isNewWorkflowGroup = true;
    this.workflowGroup.reset();
  }

  private _removeWorkflowGroup(referenceId: string, canRestore: boolean = false): void {
    this._deletedWorkflows = [];
    if (canRestore) {
      this._deletedWorkflows = this._deletedWorkflows.concat(this.workflows.filter(payload => payload.referenceId === referenceId));
    }

    this.workflows = this.workflows.filter(payload => payload.referenceId !== referenceId);
    this._removeChildWorkflows(referenceId, canRestore);
  }

  private _removeChildWorkflows(parentReferenceId: string, canRestore: boolean = false): void {
    if (canRestore) {
      let workflowsToRemove = this.workflows.filter(payload => payload.parentReferenceId === parentReferenceId);
      this._deletedWorkflows =
        this._deletedWorkflows.concat(workflowsToRemove);
    }
    this.workflows = this.workflows.filter(payload => payload.parentReferenceId !== parentReferenceId);
  }

  private _showWorkflowsUpdateNotification(title: string, serviceId: string, existing: boolean = false): void {
    let action = existing ? 'updated' : 'added';
    let message = `${title} - ${serviceId} is ${action}.`;
    this._snackBar.open(message, '', {
      duration: standardSnackbarDurationInMs
    });
  }

  private _showWorkflowRemovalNotification(title: string): void {
    let deleteConfirmationRef = this._snackBar.open(`${title} removed.`, 'Undo', {
      duration: removeWorkflowsSnackbarDurationInMs
    });

    deleteConfirmationRef.onAction()
    .pipe(takeUntil(this._deleteWorkflowSubject))
    .subscribe(() => {
      this._restoreDeletedWorkflows(this._deletedWorkflows);
    });
  }

  private _restoreDeletedWorkflows(deletedWorkflows: Workflow[]): void {
    if (isNullOrEmpty(deletedWorkflows)) {
      return;
    }

    this.newlyAddedWorkflowIds = [];
    let offset = 0;

    while (!isNullOrEmpty(deletedWorkflows)) {
      let workflow = deletedWorkflows.shift();
      let isParentWorkflow = !isNullOrEmpty(workflow.serviceId);

      if (isParentWorkflow) {
        this.workflows.push(workflow);
      } else {
        // Resolve parent workflow
        let parentWorkflow: Workflow = this.workflows.find((item) => item.referenceId === workflow.parentReferenceId);
        let parentWorkflowIndex: number = this.workflows.findIndex((item) => item.referenceId === parentWorkflow.referenceId);
        let childWorkflowIndex = parentWorkflowIndex + 1 + offset++;

        if (!isNullOrEmpty(parentWorkflow)) {
          this.workflows.splice(childWorkflowIndex, 0, workflow);
        }
      }

      this.newlyAddedWorkflowIds.push(workflow.referenceId);
    }

    this._saveState();

    this._changeDetectorRef.markForCheck();
    this._markFirstStepAsComplete();
  }

  private _saveState(): void {
    let state: WorkflowGroupSaveState = null;
    let hasChanges = !isNullOrEmpty(this.workflows);

    if (hasChanges) {
      state = {
        companyId: this.context.companyId,
        targetSource: this.context.targetSource,
        workflowGroupId: this.config.id.toString(),
        serviceId: this.workflows[0].serviceId,
        description: this.workflows[0].title,
        config: cloneDeep(this.config),
        workflows: cloneDeep(this.workflows)
      };
    }

    this._tryRemoveCurrentWorkflowFromSavedState();
    let currentState = this.savedState;
    currentState.push(state);
    this.savedState = currentState;
  }

  private _tryLoadSavedState(): void {
    if (isNullOrEmpty(this.savedState) || this._getSavedStateIndex() < 0) {
      return;
    }

    const loadSaveStateDialogRef = this._dialog.open(LaunchPadLoadStateDialogComponent, {
      data: this.savedState[this._getSavedStateIndex()]
    });

    loadSaveStateDialogRef.afterClosed()
    .pipe(takeUntil(this._dialogSubject))
    .subscribe(result => {
      if (result === true) {
        this._loadSavedState();
      } else if (result === false) {
        this._tryRemoveCurrentWorkflowFromSavedState();
      }
    });
  }

  private _loadSavedState(): void {
    let foundStateIndex = this._getSavedStateIndex();

    this._initializeWorkflowProcess(cloneDeep(this.savedState[foundStateIndex].workflows));
    this._resetForm();
    this._markFirstStepAsComplete();
  }

  private _getSavedStateIndex(): number {
    return this.savedState.findIndex((state) =>
    state.companyId === this.context.companyId
    && state.targetSource === this.context.targetSource
    && state.serviceId === this.context.serviceId
    && state.workflowGroupId === this.config.id.toString());
  }

  private _tryRemoveCurrentWorkflowFromSavedState(): void {
    let foundStateIndex = this._getSavedStateIndex();

    if (foundStateIndex >= 0) {
      let currentState = this.savedState;
      currentState.splice(foundStateIndex, 1);
      this.savedState = currentState;
    }
  }
}
