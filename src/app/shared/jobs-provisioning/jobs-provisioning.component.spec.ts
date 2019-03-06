import {
  async,
  TestBed,
  fakeAsync,
  discardPeriodicTasks
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JobsProvisioningComponent } from './jobs-provisioning.component';
import { McsTextContentProvider } from '@app/core';
import { getEnumString } from '@app/utilities';
import {
  McsJob,
  JobStatus,
  McsTask
} from '@app/models';
import { CoreTestingModule } from '@app/core/testing';

describe('JobsProvisioningComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: JobsProvisioningComponent;

  // Creation of notification based on id and status
  let createNotification = (notificationId: string, notificationStatus: JobStatus) => {
    let notification: McsJob = new McsJob();

    notification.id = notificationId;
    notification.errorMessage = getEnumString(JobStatus, notificationStatus);
    notification.createdOn = new Date('2017-04-26T01:51:34Z');
    notification.startedOn = new Date('2017-04-26T01:51:34Z');
    notification.updatedOn = new Date('2017-04-26T01:55:12Z');
    notification.endedOn = null;
    notification.status = notificationStatus;
    notification.summaryInformation = 'Test Job 2 Summary';
    notification.initiatorFullName = 'Shaun Domingo';
    notification.elapsedTimeInSeconds = 0;
    notification.description = 'mongo-db' + notificationId;

    notification.tasks = new Array();
    let task = new McsTask();
    task.description = 'new task';
    task.ectInSeconds = 5;
    task.elapsedTimeInSeconds = 0;
    notification.tasks.push(task);

    return notification;
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        JobsProvisioningComponent
      ],
      imports: [
        RouterTestingModule,
        CoreTestingModule
      ],
      providers: [
        McsTextContentProvider
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(JobsProvisioningComponent, {
      set: {
        template: `
        <div> ProvisioningNotificationsComponent Template </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(JobsProvisioningComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;

      component.jobs = new Array();
      component.jobs.push(createNotification('12345', JobStatus.Active));
      component.jobs.push(createNotification('12346', JobStatus.Failed));
      component.jobs.push(createNotification('12347', JobStatus.Completed));
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      component.ngDoCheck();
      discardPeriodicTasks();
    }));

    it(`should not be null/undefine the value of textContent`, () => {
      expect(component.textContent).toBeDefined();
    });

    it(`should set the progressbar maximum based on the ectInSeconds of all the tasks`, () => {
      expect(component.progressMax).toBe(15);
    });

    it(`should set the progressbar value periodically starting from 0`, () => {
      expect(component.progressValue).toBe(0);
    });
  });
});
