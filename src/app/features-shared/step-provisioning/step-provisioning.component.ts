import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  McsJob,
  DataStatus
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-step-provisioning',
  templateUrl: 'step-provisioning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class StepProvisioningComponent implements OnChanges {
  public status$: Observable<DataStatus>;

  @Input()
  public jobs: McsJob[];

  @Input()
  public requestState: DataStatus;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngOnChanges(changes: SimpleChanges) {
    let requestChange = changes['requestState'];
    let jobsChange = changes['jobs'];

    let inputsHasChanged = !isNullOrEmpty(requestChange) || !isNullOrEmpty(jobsChange);
    if (inputsHasChanged) {
      this._setProvisioningStatus();
    }
  }

  public get dataStatusEnum(): any {
    return DataStatus;
  }

  /**
   * Sets the provisioning status based on the job contents
   */
  private _setProvisioningStatus(): void {
    let requestHasFinished = this.requestState === DataStatus.Error ||
      this.requestState === DataStatus.InProgress;
    if (requestHasFinished) {
      this.status$ = of(this.requestState);
      this._changeDetectorRef.markForCheck();
      return;
    }

    let waitingForJob = this.requestState === DataStatus.Success && isNullOrEmpty(this.jobs);
    if (waitingForJob) {
      this.status$ = of(DataStatus.InProgress);
      this._changeDetectorRef.markForCheck();
      return;
    }

    this.status$ = of(DataStatus.Success);
    this._changeDetectorRef.markForCheck();
  }
}
