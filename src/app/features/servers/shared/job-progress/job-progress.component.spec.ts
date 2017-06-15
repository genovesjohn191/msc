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
  McsAssetsProvider,
  McsApiJob,
  McsNotificationContextService,
  CoreDefinition,
} from '../../../../core';
import { ContextualHelpDirective } from '../contextual-help/contextual-help.directive';

describe('JobProgressComponent', () => {

  /** Stub Services/Components */
  let fixture: any;
  let component: JobProgressComponent;
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        spinner: 'fa fa-spinner',
        close: 'fa fa-close',
        check: 'fa fa-check',
        circle: 'fa fa-circle'
      };
      return icons[key];
    }
  } as McsAssetsProvider;
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
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        JobProgressComponent,
        ContextualHelpDirective
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        McsNotificationContextService,
        { provide: McsAssetsProvider, useValue: mockAssetsProvider },
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

  describe('getStatusIconClass() when status is Active', () => {
    it('should return active class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_ACTIVE))
        .toContain('active');
    });

    it('should return fa-spinner class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_ACTIVE))
        .toContain('fa-spinner');
    });
  });

  describe('getStatusIconClass() when status is Pending', () => {
    it('should return active class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_PENDING))
        .toContain('active');
    });

    it('should return fa-spinner class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_PENDING))
        .toContain('fa-spinner');
    });
  });

  describe('getStatusIconClass() when status is Timedout', () => {
    it('should return failed class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_TIMEDOUT))
        .toContain('failed');
    });

    it('should return fa-close class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_TIMEDOUT))
        .toContain('fa-close');
    });
  });

  describe('getStatusIconClass() when status is Failed', () => {
    it('should return failed class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_FAILED))
        .toContain('failed');
    });

    it('should return fa-close class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_FAILED))
        .toContain('fa-close');
    });
  });

  describe('getStatusIconClass() when status is Cancelled', () => {
    it('should return failed class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_CANCELLED))
        .toContain('failed');
    });

    it('should return fa-close class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_CANCELLED))
        .toContain('fa-close');
    });
  });

  describe('getStatusIconClass() when status is Completed', () => {
    it('should return completed class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_COMPLETED))
        .toContain('completed');
    });

    it('should return fa-check class', () => {
      expect(component.getStatusIconClass(CoreDefinition.NOTIFICATION_JOB_COMPLETED))
        .toContain('fa-check');
    });
  });

  describe('getCircleClass()', () => {
    it('should return circle class', () => {
      expect(component.getCircleClass()).toContain('fa-circle');
    });
  });
});
