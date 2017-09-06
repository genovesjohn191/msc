import {
  async,
  TestBed,
  fakeAsync,
  discardPeriodicTasks
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProvisioningNotificationsComponent } from './provisioning-notifications.component';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsApiJob
} from '../../../../core';

describe('ProvisioningNotificationsComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: ProvisioningNotificationsComponent;

  // Creation of notification based on id and status
  let createNotification = (notificationId: string, notificationStatus: string) => {
    let notification: McsApiJob = new McsApiJob();

    notification.id = notificationId;
    notification.errorMessage = notificationStatus;
    notification.createdOn = new Date('2017-04-26T01:51:34Z');
    notification.startedOn = new Date('2017-04-26T01:51:34Z');
    notification.updatedOn = new Date('2017-04-26T01:55:12Z');
    notification.endedOn = null;
    notification.status = notificationStatus;
    notification.summaryInformation = 'Test Job 2 Summary';
    notification.ownerName = 'Shaun Domingo';
    notification.durationInSeconds = 0;
    notification.description = 'mongo-db' + notificationId;
    notification.ectInSeconds = 5;

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
        RouterTestingModule
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

      component.jobs.push(createNotification('12345', CoreDefinition.NOTIFICATION_JOB_ACTIVE));
      component.jobs.push(createNotification('12346', CoreDefinition.NOTIFICATION_JOB_FAILED));
      component.jobs.push(createNotification('12347', CoreDefinition.NOTIFICATION_JOB_COMPLETED));
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      discardPeriodicTasks();
    }));

    it(`should not be null/undefine the value of textContent`, () => {
      expect(component.textContent).toBeDefined();
    });

    it(`should set the progressbar maximum based on the ectInSeconds of all the jobs`, () => {
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
      let jobCompleted = component.isJobCompleted(createNotification('12348',
        CoreDefinition.NOTIFICATION_JOB_ACTIVE));
      expect(jobCompleted).toBeFalsy();
    });

    it(`should return false when job is pending`, () => {
      let jobCompleted = component.isJobCompleted(createNotification('12348',
        CoreDefinition.NOTIFICATION_JOB_PENDING));
      expect(jobCompleted).toBeFalsy();
    });

    it(`should return true when job is not active | pending`, () => {
      let jobCompleted = component.isJobCompleted(createNotification('12348',
        CoreDefinition.NOTIFICATION_JOB_COMPLETED));
      expect(jobCompleted).toBeTruthy();
    });
  });

  describe('isJobError()', () => {
    it(`should return true when job is completed/successful`, () => {
      let jobSuccess = component.isJobSuccessful(createNotification('12348',
        CoreDefinition.NOTIFICATION_JOB_COMPLETED));
      expect(jobSuccess).toBeTruthy();
    });

    it(`should return false when job is not completed/successful`, () => {
      let jobSuccess = component.isJobSuccessful(createNotification('12348',
        CoreDefinition.NOTIFICATION_JOB_FAILED));
      expect(jobSuccess).toBeFalsy();
    });
  });

  describe('getStatusIcon()', () => {
    it(`should return the iconKey to spinner, iconColor to black, iconClass to active
    when the job status is active`, () => {
      let jobStatus = component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_ACTIVE);
      expect(jobStatus.key).toBe(CoreDefinition.ASSETS_GIF_SPINNER);
      expect(jobStatus.color).toBe('black');
      expect(jobStatus.class).toBe('active');
    });

    it(`should return the iconKey to spinner, iconColor to black, iconClass to active
    when the job status is pending`, () => {
      let jobStatus = component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_PENDING);
      expect(jobStatus.key).toBe(CoreDefinition.ASSETS_GIF_SPINNER);
      expect(jobStatus.color).toBe('black');
      expect(jobStatus.class).toBe('active');
    });

    it(`should return the iconKey to close, iconColor to red, iconClass to failed
    when the job status is timedout`, () => {
      let jobStatus = component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_TIMEDOUT);
      expect(jobStatus.key).toBe(CoreDefinition.ASSETS_FONT_CLOSE);
      expect(jobStatus.color).toBe('red');
      expect(jobStatus.class).toBe('failed');
    });

    it(`should return the iconKey to close, iconColor to red, iconClass to failed
    when the job status is cancelled`, () => {
      let jobStatus = component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_CANCELLED);
      expect(jobStatus.key).toBe(CoreDefinition.ASSETS_FONT_CLOSE);
      expect(jobStatus.color).toBe('red');
      expect(jobStatus.class).toBe('failed');
    });

    it(`should return the iconKey to close, iconColor to red, iconClass to failed
    when the job status is failed`, () => {
      let jobStatus = component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_FAILED);
      expect(jobStatus.key).toBe(CoreDefinition.ASSETS_FONT_CLOSE);
      expect(jobStatus.color).toBe('red');
      expect(jobStatus.class).toBe('failed');
    });

    it(`should return the iconKey to check, iconColor to green, iconClass to completed
    when the job status is completed`, () => {
      let jobStatus = component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_COMPLETED);
      expect(jobStatus.key).toBe(CoreDefinition.ASSETS_FONT_CHECK);
      expect(jobStatus.color).toBe('green');
      expect(jobStatus.class).toBe('completed');
    });
  });
});
