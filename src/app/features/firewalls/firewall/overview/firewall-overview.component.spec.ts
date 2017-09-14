import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { FirewallOverviewComponent } from './firewall-overview.component';
import { FirewallsTestingModule } from '../../testing';
import { Firewall } from '../../models';
import { FirewallService } from '../firewall.service';

describe('FirewallOverviewComponent', () => {
  /** Stub Services/Components */
  let component: FirewallOverviewComponent;
  let firewallService: FirewallService;

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

    /** Testbed Onverriding of Components */
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

      component = fixture.componentInstance;
      firewallService = getTestBed().get(FirewallService);
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should define the text content value to firewallOverviewTextContent', () => {
      expect(component.firewallOverviewTextContent).toBeDefined();
    });

    it('should call the subscribe() of FirewallService selectedFirewallStream', () => {
      spyOn(firewallService.selectedFirewallStream, 'subscribe');
      component.ngOnInit();
      expect(firewallService.selectedFirewallStream.subscribe).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from stream subscription', () => {
      spyOn(component.subscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.subscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
