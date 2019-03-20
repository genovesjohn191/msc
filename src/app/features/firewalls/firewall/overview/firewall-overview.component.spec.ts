import {
  async,
  TestBed
} from '@angular/core/testing';
import { FirewallsTestingModule } from '../../testing';
import { FirewallOverviewComponent } from './firewall-overview.component';

describe('FirewallOverviewComponent', () => {

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        FirewallOverviewComponent
      ],
      imports: [
        FirewallsTestingModule
      ]
    });

    /** Testbed Overriding of Components */
    TestBed.overrideComponent(FirewallOverviewComponent, {
      set: {
        template: `
          <div>Firewall Overview Component Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(FirewallOverviewComponent);
      fixture.detectChanges();
    });
  }));
});
