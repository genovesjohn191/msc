import {
  async,
  TestBed
} from '@angular/core/testing';
import { CommonDefinition } from '@app/utilities';
import { FirewallsTestingModule } from './testing';
import { FirewallsComponent } from './firewalls.component';

describe('FirewallsComponent', () => {

  /** Stub Services/Components */
  CommonDefinition.SEARCH_TIME = 0; // remove delay time
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
    // TestBed.overrideProvider(FirewallsApiService, { useValue: mockFirewallsService });

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
