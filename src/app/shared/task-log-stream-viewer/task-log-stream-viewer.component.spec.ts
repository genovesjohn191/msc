import {
  waitForAsync,
  TestBed,
  fakeAsync,
  discardPeriodicTasks
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  JobStatus,
  McsJob,
  McsTask
} from '@app/models';
import { getEnumString } from '@app/utilities';

import { TaskLogStreamViewerComponent } from './task-log-stream-viewer.component';
import { TaskLogStreamViewerModule } from './task-log-stream-viewer.module';

describe('TaskLogStreamViewerComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: TaskLogStreamViewerComponent;

  let createJob = (jobId: string, jobStatus: JobStatus) => {
    let job: McsJob = new McsJob();

    job.id = jobId;
    job.errorMessage = getEnumString(JobStatus, jobStatus);
    job.createdOn = new Date('2017-04-26T01:51:34Z');
    job.startedOn = new Date('2017-04-26T01:51:34Z');
    job.updatedOn = new Date('2017-04-26T01:55:12Z');
    job.endedOn = null;
    job.status = jobStatus;
    job.summaryInformation = 'Test Job 2 Summary';
    job.initiatorFullName = 'Shaun Domingo';
    job.elapsedTimeInSeconds = 0;
    job.description = 'mongo-db' + jobId;

    job.tasks = new Array();
    let task = new McsTask();
    task.description = 'new task';
    task.ectInSeconds = 5;
    task.elapsedTimeInSeconds = 0;
    job.tasks.push(task);

    return job;
  };

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TaskLogStreamViewerComponent
      ],
      imports: [
        CoreTestingModule,
        TaskLogStreamViewerModule
      ],
      providers: [
        EventBusDispatcherService
      ]
    });

    TestBed.overrideComponent(TaskLogStreamViewerComponent, {
      set: {
        template: `
        <div> TaskLogStreamViewerComponent Template </div>
        <div #logViewer class="log-viewer"></div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TaskLogStreamViewerComponent);

      component = fixture.componentInstance;
      component.job = createJob('12345', JobStatus.Active);
    });
  }));

  /** Test Implementation */
  describe('ngAfterViewInit()', () => {
    beforeEach(fakeAsync(() => {
      component.ngAfterViewInit();
      fixture.detectChanges();
      discardPeriodicTasks();
    }));

    it(`should create the mcs-task-log-stream-viewer element`, (done) => {
      expect(component).toBeTruthy();
      done();
    });

    it('should have an active job status', (done) => {
      let jobStatus = component.getJobStatus(component.job.status);
      expect(jobStatus).toBe('Active');
      done();
    });
  });
});
