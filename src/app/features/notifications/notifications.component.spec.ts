import {
  async,
  inject,
  TestBed,
  tick,
  fakeAsync
} from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  McsTextContentProvider,
  McsApiSearchKey,
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsApiJob,
  McsApiService,
  McsNotificationContextService,
  McsNotificationJobService,
  CoreDefinition
} from '../../core';
import {
  NotificationsTestingModule,
  mockNotificationsService
} from './testing';

import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from './notifications.service';

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
    TestBed.overrideProvider(NotificationsService, { useValue: mockNotificationsService });

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
    // TODO: Add the new unit test for ticket listing
  });
});
