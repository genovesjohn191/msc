import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  JobStatus,
  jobStatusText,
  McsJob,
  McsTaskLog
} from '@app/models';
import {
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { MatSnackBar } from '@angular/material/snack-bar';

// NOTE: This component will only read the first tasks in the job.

const ANSI_TO_HTML_CONVERTER = require('ansi-to-html');
const AUTO_SCROLL_INTERVAL: number = 200;

@Component({
  selector: 'mcs-task-log-stream-viewer',
  templateUrl: 'task-log-stream-viewer.component.html',
  styleUrls: ['task-log-stream-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskLogStreamViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('logViewer')
  protected logViewer: ElementRef;

  @Input()
  public height: number;

  @Input()
  public get job(): McsJob {
    return this._job;
  }
  public set job(val: McsJob) {
    let validJob = isNullOrEmpty(this.job) && !isNullOrEmpty(val);
    if (!validJob) {
      return;
    }
    this.value = '';
    this._job = val;
  }

  @Input()
  public get value(): string {
    return this._value;
  }
  public set value(val: string) {
    if (isNullOrEmpty(val)) {
      this._value = '';
      return;
    }

    this._value = this._converter.toHtml(val);
  }

  public get viewerStyleHeight(): string {
    return this.height ? `height: ${ this.height.toString() }px;` : '';
  }

  public rawValue: string = '';
  public panelOpenState: boolean = true;

  private _value: string;
  private _job: McsJob;
  private _logs: string[] = [];
  private _currentUserJobHandler: Subscription;
  private _autoScrollToBottom: boolean = true;
  private _scrollCounter: number = 0;
  private _intervalId: any;

  private _converter = new ANSI_TO_HTML_CONVERTER({
    fg: '#fff',
    bg: '#000',
    newline: true,
    escapeXML: true,
    stream: true
  });

  public constructor(
    private _changeDetector: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService,
    private _snackBar: MatSnackBar) {}

  public ngAfterViewInit(): void {
    this._initialize();

    this._intervalId = setInterval(() => {
      if (this._autoScrollToBottom) { this._scrollToBottom(); }
    }, AUTO_SCROLL_INTERVAL);
  }

  public ngOnDestroy() {
    clearInterval(this._intervalId);
    unsubscribeSafely(this._currentUserJobHandler);
  }

  public onScroll(): void {
    let viewerElem = this.logViewer.nativeElement;

    this._scrollCounter = this._scrollCounter + 1;
    let scrollBarIsBottomed: boolean = viewerElem.scrollHeight - viewerElem.scrollTop === this.height;

    if (scrollBarIsBottomed) {
      // Renable auto-scroll
      this._scrollCounter = 1;
    }

    this._autoScrollToBottom = this._scrollCounter < 2;
  }

  public getJobStatus(status: JobStatus): string {
    return jobStatusText[status];
  }

  public getStatusIconKey(status: any): string {
    let jobStatus = status;
    if (typeof status === 'number') {
      jobStatus = JobStatus[status];
    }

    switch(jobStatus) {
      case jobStatusText[JobStatus.Pending]:
      case jobStatusText[JobStatus.Active]:
        return CommonDefinition.ASSETS_GIF_LOADER_ELLIPSIS;

      case jobStatusText[JobStatus.Completed]:
        return CommonDefinition.ASSETS_SVG_SUCCESS;

      case jobStatusText[JobStatus.Failed]:
      case jobStatusText[JobStatus.TimedOut]:
      case jobStatusText[JobStatus.SessionExpired]:
      case jobStatusText[JobStatus.Cancelled]:
        return CommonDefinition.ASSETS_SVG_ERROR;
    }
  }

  public contentCopied(): void {
    this._snackBar.open(
    this._translateService.instant('snackBar.terraformDeploymentActivitiesLogCopy'),
    '',
    {
      duration: CommonDefinition.SNACKBAR_STANDARD_DURATION,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private _scrollToBottom(): void {
    let noJobToMonitor: boolean = isNullOrEmpty(this.job) || this.job.status >= JobStatus.Completed;
    if (noJobToMonitor) { return; }

    let viewerElem = this.logViewer.nativeElement;

    // Resets auto scroll counter to ensure continuous auto scroll
    // 1 -> AUTO SCROLL
    // 2+ -> MANUAL SCROLL
    this._scrollCounter = this._scrollCounter - 1;

    if (isNullOrEmpty(this.logViewer) || !this._autoScrollToBottom) { return; }

    viewerElem.scroll({
      top: viewerElem.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  private _initialize(): void {
    if (isNullOrEmpty(this.job)) {
      return;
    }

    this.job.tasks[0]?.logs?.forEach((log) => {
      this._logs.push(log.message);
    });

    let hasExistingLogs = !isNullOrEmpty(this._logs);
    if (hasExistingLogs) {
      this.value = this._logs.join('\n');
      this.rawValue = this._logs.join('\n');
      this._changeDetector.markForCheck();
    }

    if (this.job.status < JobStatus.Completed) {
      this._startListeningToJobUpdates();
    } else {
      clearInterval(this._intervalId);
    }
  }

  private _startListeningToJobUpdates(): void {
    this._currentUserJobHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._onJobUpdatesReceived.bind(this));

    if (isNullOrEmpty(this.value)) {
      this._changeDetector.markForCheck();
    }
  }

  private _onJobUpdatesReceived(job: McsJob): void {
    let watchedJob = !isNullOrEmpty(job) && job.id === this.job.id;
    if (!watchedJob)  { return; }

    let taskLogs: McsTaskLog[] = job.tasks[0].logs;
    let noNewLogs = isNullOrEmpty(taskLogs) || taskLogs.length <= this._logs.length;
    this.job.status = job.status;

    this._changeDetector.detectChanges();

    if (noNewLogs) { return; }

    this.appendLogs(taskLogs);
  }

  private appendLogs(taskLogs: McsTaskLog[]): void {
    let startIndex: number = this._logs.length;
    for (let i = startIndex; i < taskLogs.length; ++i) {
      this._logs.push(taskLogs[i].message);
    }

    this.value = this._logs.join('\n');
    this.rawValue = this._logs.join('\n');
    this._changeDetector.markForCheck();
  }
}
