import {
  async,
  TestBed
} from '@angular/core/testing';
import { CoreDefinition } from '../../core';
import { FirewallsComponent } from './firewalls.component';
import { FirewallsService } from './firewalls.service';
import {
  FirewallsTestingModule,
  mockFirewallsService
} from './testing';

describe('FirewallsComponent', () => {

  /** Stub Services/Components */
  CoreDefinition.SEARCH_TIME = 0; // remove delay time
  let component: FirewallsComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        FirewallsComponent
      ],
      imports: [
        FirewallsTestingModule
      ]
    });

    /** Testbed Overriding of Providers */
    TestBed.overrideProvider(FirewallsService, { useValue: mockFirewallsService });

    /** Testbed Overriding of Components */
    TestBed.overrideComponent(FirewallsComponent, {
      set: {
        template: `
          <div>Firewalls Component Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(FirewallsComponent);
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