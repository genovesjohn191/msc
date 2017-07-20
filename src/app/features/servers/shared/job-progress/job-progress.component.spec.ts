import {
  async,
  TestBed,
  fakeAsync,
  discardPeriodicTasks,
  tick
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JobProgressComponent } from './job-progress.component';
import {
  McsApiJob,
  CoreDefinition
} from '../../../../core';
import { ContextualHelpDirective } from '../contextual-help/contextual-help.directive';

describe('JobProgressComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: JobProgressComponent;

  // Creation of notification based on id and status
  let createNotification = (notificationId: string, notificationStatus: string) => {
    let notification: McsApiJob = new McsApiJob();

    notification.id = notificationId;
    notification.errorMessage = notificationStatus;
    notification.ectInSeconds = 10;
    notification.createdOn = new Date('2017-04-26T01:51:34Z');
    notification.startedOn = new Date('2017-04-26T01:51:34Z');
    notification.updatedOn = new Date('2017-04-26T01:55:12Z');
    notification.endedOn = null;
    notification.status = notificationStatus;
    notification.summaryInformation = 'Test Job 2 Summary';
    notification.ownerName = 'Shaun Domingo';
    notification.durationInSeconds = 0;
    notification.description = 'mongo-db' + notificationId;

    return notification;
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        JobProgressComponent,
        ContextualHelpDirective
      ],
      imports: [
        RouterTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(JobProgressComponent, {
      set: {
        template: `
        <div mcsContextualHelp="Contextual Help">
          JobProgressComponent Template
        </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(JobProgressComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.job = createNotification('0001', 'Completed');
      component.contextualHelp = 'Context';
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should set the progressbar maximum value to 10', fakeAsync(() => {
      component.ngOnInit();
      discardPeriodicTasks();
      expect(component.progressMax).toBe(10);
    }));
  });

  describe('ngAfterViewInit() | getContextualInformations()', () => {
    it('should get all the contextual help within the component', fakeAsync(() => {
      component.ngAfterViewInit();
      tick(CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
      expect(component.contextualHelpDirectives.length).toBe(1);
      expect(component.getContextualInformations().length).toBe(1);
    }));
  });

  describe('isJobActive()', () => {
    it('should return false if the job is not Active|Pending', () => {
      component.job.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
      expect(component.isJobActive()).toBeFalsy();
    });

    it('should return true if the job is Active|Pending', () => {
      component.job.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
      expect(component.isJobActive()).toBeTruthy();
    });
  });

  describe('getStatusIcon() when status is Active', () => {
    it('should return active class', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_ACTIVE).class)
        .toBe('active');
    });

    it('should return spinner icon key definition', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_ACTIVE).key)
        .toBe(CoreDefinition.ASSETS_FONT_SPINNER);
    });

    it('should return the color', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_ACTIVE).color)
        .toBe('black');
    });
  });

  describe('getStatusIcon() when status is Pending', () => {
    it('should return active class', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_PENDING).class)
        .toBe('active');
    });

    it('should return spinner icon key definition', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_PENDING).key)
        .toBe(CoreDefinition.ASSETS_FONT_SPINNER);
    });

    it('should return the color', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_PENDING).color)
        .toBe('black');
    });
  });

  describe('getStatusIcon() when status is Timedout', () => {
    it('should return failed class', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_TIMEDOUT).class)
        .toBe('failed');
    });

    it('should return close icon key definition', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_TIMEDOUT).key)
        .toBe(CoreDefinition.ASSETS_FONT_CLOSE);
    });

    it('should return the color', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_TIMEDOUT).color)
        .toBe('red');
    });
  });

  describe('getStatusIcon() when status is Failed', () => {
    it('should return failed class', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_FAILED).class)
        .toBe('failed');
    });

    it('should return close icon key definition', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_FAILED).key)
        .toBe(CoreDefinition.ASSETS_FONT_CLOSE);
    });

    it('should return the color', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_FAILED).color)
        .toBe('red');
    });
  });

  describe('getStatusIcon() when status is Cancelled', () => {
    it('should return failed class', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_CANCELLED).class)
        .toBe('failed');
    });

    it('should return close icon key definition', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_CANCELLED).key)
        .toBe(CoreDefinition.ASSETS_FONT_CLOSE);
    });

    it('should return the color', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_CANCELLED).color)
        .toBe('red');
    });
  });

  describe('getStatusIcon() when status is Completed', () => {
    it('should return completed class', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_COMPLETED).class)
        .toBe('completed');
    });

    it('should return check icon key definition', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_COMPLETED).key)
        .toBe(CoreDefinition.ASSETS_FONT_CHECK);
    });

    it('should return the color', () => {
      expect(component.getStatusIcon(CoreDefinition.NOTIFICATION_JOB_COMPLETED).color)
        .toBe('green');
    });
  });

  describe('IconKey() | Properties', () => {
    it('should get the circle icon key definition', () => {
      expect(component.circleIconKey).toBe(CoreDefinition.ASSETS_FONT_CIRCLE);
    });
  });
});
