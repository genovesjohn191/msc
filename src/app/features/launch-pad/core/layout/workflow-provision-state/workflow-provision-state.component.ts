import { Subscription } from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  JobStatus,
  McsJob,
  McsTask
} from '@app/models';
import {
  addOrUpdateArrayRecord,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  cloneDeep
} from '@app/utilities';

import { Workflow } from '../../workflows/workflow.interface';

export enum WorkflowProvisionCompletionState
{
  Processing,
  Successful,
  WithError
}

@Component({
  selector: 'mcs-launch-pad-workflow-provision-state',
  templateUrl: 'workflow-provision-state.component.html',
  styleUrls: [ './workflow-provision-state.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadWorkflowProvisionStateComponent implements OnDestroy {
  @Input()
  public workflows: Workflow[];

  @Input()
  public set state(value: McsJob[]) {
    if (isNullOrEmpty(value)) { return; }

    this._jobs = value;
    this._startMonitoringProvisioningProgress();
    this._changeDetector.markForCheck();
  }

  public get state(): McsJob[] {
    return this._jobs;
  }

  @Output()
  public completed: EventEmitter<WorkflowProvisionCompletionState>;

  public get infoIcon(): string {
    return CommonDefinition.ASSETS_SVG_INFO;
  }

  public get errorIcon(): string {
    return CommonDefinition.ASSETS_SVG_ERROR;
  }

  public get completionState(): WorkflowProvisionCompletionState {
    let hasError: boolean = false;
    let hasOngoing: boolean = false;

    this._jobs.forEach((job) => {
      job.tasks.forEach((task) => {
        if (task.status > JobStatus.Completed) {
          hasError = true;
        }
        if (task.status < JobStatus.Completed) {
          hasOngoing = true;
        }
      });
    });

    return hasOngoing ? WorkflowProvisionCompletionState.Processing :
      hasError ? WorkflowProvisionCompletionState.WithError :
      WorkflowProvisionCompletionState.Successful;
  }

  private _currentUserJobHandler: Subscription;
  private _jobs: McsJob[];

  public constructor(private _changeDetector: ChangeDetectorRef, private _eventDispatcher: EventBusDispatcherService) {
    this.completed = new EventEmitter();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._currentUserJobHandler);
  }

  public getTaskInfo(workflow: Workflow): McsTask | undefined {
    if (isNullOrEmpty(this.state)) { return undefined; }

    let reference: string = isNullOrEmpty(workflow.parentReferenceId) ? workflow.referenceId : workflow.parentReferenceId;

    let job = this._jobs.find((j) => j.referenceId === reference);
    let task = job.tasks.find((t) => t.referenceId === workflow.referenceId);

    return task;
  }

  public clone(referenceObject: any): any {
    return cloneDeep(referenceObject);
  }

  public validReferenceObject(referenceObject: any): boolean {
    return !isNullOrEmpty(referenceObject) && Object.keys(referenceObject).length > 0;
  }

  private _startMonitoringProvisioningProgress(): void {
    this._currentUserJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobCurrentUser, this._onCurrentUserJob.bind(this));
  }

  private _onCurrentUserJob(job: McsJob): void {
    if (isNullOrEmpty(job) || this._jobs.findIndex((j) => j.id === job.id) < 0 ) { return; }

    this._jobs = addOrUpdateArrayRecord(
      this._jobs,
      job,
      false,
      (_existingJob: McsJob) => {
        return _existingJob.id === job.id;
      });

    let state = this.completionState;
    if (state !== WorkflowProvisionCompletionState.Processing) {
      this.completed.emit(state);
    }

    this._changeDetector.markForCheck();
  }
}
