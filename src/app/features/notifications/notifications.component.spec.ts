import {
  async,
  TestBed
} from '@angular/core/testing';
import { CoreDefinition } from '@app/core';
import {
  NotificationsTestingModule,
  mockNotificationsService
} from './testing';
import { NotificationsComponent } from './notifications.component';
import { JobsApiService } from '@app/services';

describe('NotificationsComponent', () => {

  /** Stub Services/Components */
  CoreDefinition.SEARCH_TIME = 0;
  let component: NotificationsComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        NotificationsComponent
      ],
      imports: [
        NotificationsTestingModule
      ]
    });

    /** Testbed Onverriding of Providers */
    TestBed.overrideProvider(JobsApiService, { useValue: mockNotificationsService });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(NotificationsComponent, {
      set: {
        template: `
          <div>NotificationsComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(NotificationsComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit() | constructor', () => {
    if (component) {
      /*
        This is needed to remove the lint error of not using component variable.
        .::. Need unit test for this component
      */
    }
  });
});
