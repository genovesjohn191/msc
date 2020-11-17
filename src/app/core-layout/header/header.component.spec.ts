import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { McsNavigationService } from '@app/core/services/mcs-navigation.service';
import { CommonDefinition } from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {

  /** Stub Services/Components */
  let component: HeaderComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        HeaderComponent
      ], providers: [
        EventBusDispatcherService,
        McsNavigationService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(HeaderComponent, {
      set: {
        template: `<div>HeaderComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(HeaderComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {

  });
});
