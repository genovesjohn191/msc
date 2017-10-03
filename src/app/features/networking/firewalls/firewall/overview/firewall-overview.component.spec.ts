import {
  async,
  TestBed
} from '@angular/core/testing';
import { FirewallOverviewComponent } from './firewall-overview.component';
import {
  NetworkingTestingModule,
  mockFirewallService
} from '../../../testing';
import { FirewallService } from '../firewall.service';

describe('FirewallOverviewComponent', () => {
  /** Stub Services/Components */
  let component: FirewallOverviewComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        FirewallOverviewComponent
      ],
      imports: [
        NetworkingTestingModule
      ]
    });

    /** Testbed Overriding of Providers */
    TestBed.overrideProvider(FirewallService, { useValue: mockFirewallService });

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

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should define the text content value to firewallOverviewTextContent', () => {
      expect(component.firewallOverviewTextContent).toBeDefined();
    });

    it('should call the subscribe() of FirewallService selectedFirewallStream', () => {
      spyOn(mockFirewallService.selectedFirewallStream, 'subscribe');
      component.ngOnInit();
      expect(mockFirewallService.selectedFirewallStream.subscribe).toHaveBeenCalled();
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
