import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy
} from '@angular/core';
import { McsEvent } from '@app/events';
import { McsJob, McsTask } from '@app/models';
import { addOrUpdateArrayRecord, isNullOrEmpty, unsubscribeSafely } from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { Subscription } from 'rxjs';
import { Workflow } from '../../workflows/workflow.interface';

@Component({
  selector: 'mcs-launch-pad-workflow-provision-state',
  templateUrl: 'workflow-provision-state.component.html',
  styleUrls: [ './workflow-provision-state.component.scss' ]
})
export class LaunchPadWorkflowProvisionStateComponent implements OnDestroy {
  @Input()
  public workflows: Workflow[];

  @Input()
  public set jobs(value: McsJob[]) {
    if (isNullOrEmpty(value)) { return; }

    this._jobs = value;
    this._startMonitoringProvisioningProgress();
    this._changeDetector.markForCheck();
  }

  private _currentUserJobHandler: Subscription;
  private _jobs: McsJob[];

  public constructor(private _changeDetector: ChangeDetectorRef, private _eventDispatcher: EventBusDispatcherService) { }

  public ngOnDestroy() {
    unsubscribeSafely(this._currentUserJobHandler);
  }

  public getTaskInfo(workflow: Workflow): McsTask | undefined {
    if (isNullOrEmpty(this.jobs)) { return undefined; }

    let job = this._jobs.find((j) => j.referenceId === workflow.parentReferenceId ?? workflow.referenceId);
    let task = job.tasks.find((t) => t.referenceId === workflow.referenceId);

    return task;
  }

  private _startMonitoringProvisioningProgress(): void {
    this._currentUserJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobCurrentUser, this._onCurrentUserJob.bind(this));

    this._eventDispatcher.dispatch(McsEvent.jobCurrentUser);
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

    this._changeDetector.markForCheck();
  }
}
