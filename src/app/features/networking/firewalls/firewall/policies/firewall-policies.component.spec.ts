import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { FirewallPoliciesComponent } from './firewall-policies.component';
import {
  FirewallsTestingModule,
  mockFirewallService
} from '../../testing';
import {
  FirewallPolicy,
  FirewallPolicyAction,
  FirewallPolicyNat
} from '../../models';
import { FirewallService } from '../firewall.service';

describe('FirewallOverviewComponent', () => {
  /** Stub Services/Components */
  let component: FirewallPoliciesComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        FirewallPoliciesComponent
      ],
      imports: [
        FirewallsTestingModule
      ]
    });

    /** Testbed Overriding of Providers */
    TestBed.overrideProvider(FirewallService, { useValue: mockFirewallService });

    /** Testbed Overriding of Components */
    TestBed.overrideComponent(FirewallPoliciesComponent, {
      set: {
        template: `
          <div>Firewall Policies Component Template</div>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(FirewallPoliciesComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit() | constructor', () => {
    // TODO: Add the new unit test for firewall policies listing
  });
});
