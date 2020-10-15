import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { CommonDefinition } from '@app/utilities';

import { NotificationsComponent } from './notifications.component';
import { NotificationsTestingModule } from './testing';

describe('NotificationsComponent', () => {

  /** Stub Services/Components */
  CommonDefinition.SEARCH_TIME = 0;
  let component: NotificationsComponent;

  beforeEach(waitForAsync(() => {
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
    // TestBed.overrideProvider(JobsApiService, { useValue: mockNotificationsService });

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
