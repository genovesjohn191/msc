import {
  async,
  TestBed,
  fakeAsync,
  discardPeriodicTasks
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProvisioningNotificationsComponent } from './provisioning-notifications.component';
import {
  McsTextContentProvider,
  McsApiJob,
  McsJobStatus,
  McsApiTask
} from '../../../../core';
import { CoreTestingModule } from '../../../../core/testing';
import { getEnumString } from '../../../../utilities';

describe('ProvisioningNotificationsComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: ProvisioningNotificationsComponent;

  // Creation of notification based on id and status
  let createNotification = (notificationId: string, notificationStatus: McsJobStatus) => {
    let notification: McsApiJob = new McsApiJob();

    notification.id = notificationId;
    notification.errorMessage = getEnumString(McsJobStatus, notificationStatus);
    notification.createdOn = new Date('2017-04-26T01:51:34Z');
    notification.startedOn = new Date('2017-04-26T01:51:34Z');
    notification.updatedOn = new Date('2017-04-26T01:55:12Z');
    notification.endedOn = null;
    notification.status = notificationStatus;
    notification.summaryInformation = 'Test Job 2 Summary';
    notification.ownerFullName = 'Shaun Domingo';
    notification.elapsedTimeInSeconds = 0;
    notification.description = 'mongo-db' + notificationId;

    notification.tasks = new Array();
    let task = new McsApiTask();
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
        ProvisioningNotificationsComponent
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
    TestBed.overrideComponent(ProvisioningNotificationsComponent, {
      set: {
        template: `
        <div> ProvisioningNotificationsComponent Template </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ProvisioningNotificationsComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;

      component.jobs = new Array();
      component.jobs.push(createNotification('12345', McsJobStatus.Active));
      component.jobs.push(createNotification('12346', McsJobStatus.Failed));
      component.jobs.push(createNotification('12347', McsJobStatus.Completed));
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

  describe('isMultiJobs()', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      discardPeriodicTasks();
    }));

    it(`should return true when jobs are more than 1`, () => {
      expect(component.isMultiJobs).toBeTruthy();
    });

    it(`should return false when job is only 1`, () => {
      component.jobs.pop();
      component.jobs.pop();
      expect(component.isMultiJobs).toBeFalsy();
    });
  });

  describe('getTitle()', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      discardPeriodicTasks();
    }));

    it(`should return the title for multiple server creation`, () => {
      let title = component.getTitle();
      expect(title).toBe(component.textContent.deployMultiple);
    });

    it(`should return the title for single server creation`, () => {
      component.jobs.pop();
      component.jobs.pop();
      let title = component.getTitle();
      expect(title).toBe(component.jobs[0].description);
    });
  });

  describe('isJobCompleted()', () => {
    it(`should return false when job is active`, () => {
      let jobCompleted = component.isJobCompleted(
        createNotification('12348', McsJobStatus.Active));
      expect(jobCompleted).toBeFalsy();
    });

    it(`should return false when job is pending`, () => {
      let jobCompleted = component.isJobCompleted(
        createNotification('12348', McsJobStatus.Pending));
      expect(jobCompleted).toBeFalsy();
    });

    it(`should return true when job is not active | pending`, () => {
      let jobCompleted = component.isJobCompleted(
        createNotification('12348', McsJobStatus.Completed));
      expect(jobCompleted).toBeTruthy();
    });
  });

  describe('isJobError()', () => {
    it(`should return true when job is completed/successful`, () => {
      let jobSuccess = component.isJobSuccessful(
        createNotification('12348', McsJobStatus.Completed));
      expect(jobSuccess).toBeTruthy();
    });

    it(`should return false when job is not completed/successful`, () => {
      let jobSuccess = component.isJobSuccessful(
        createNotification('12348', McsJobStatus.Failed));
      expect(jobSuccess).toBeFalsy();
    });
  });
});
