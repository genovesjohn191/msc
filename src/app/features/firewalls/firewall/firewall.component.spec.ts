import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { FirewallComponent } from './firewall.component';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FirewallsTestingModule } from '../testing';
import { FirewallsService } from '../firewalls.service';
import { FirewallService } from './firewall.service';

describe('FirewallComponent', () => {
  /** Stub Services/Components */
  let component: FirewallComponent;
  let router: Router;
  let firewallsService: FirewallsService;
  let firewallService: FirewallService;
  let mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get(key: any): string {
          return 'b88892a1-9332-48da-a49c-10edbc8f807b';
        }
      }
    }
  };
  let mockFirewallDetails = {
    id: 'b88892a1-9332-48da-a49c-10edbc8f807b',
    serviceId: 'M1VFW27117001',
    managementName: 'contoso-fw01'
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        FirewallComponent
      ],
      imports: [
        FirewallsTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        RouterTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(FirewallComponent, {
      set: {
        template: `
          <div>Firewall Component Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(FirewallComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      router = getTestBed().get(Router);
      firewallsService = getTestBed().get(FirewallsService);
      firewallService = getTestBed().get(FirewallService);
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should define the text content value to firewallTextContent', () => {
      expect(component.firewallTextContent).toBeDefined();
    });

    it('should set the selected firewall', () => {
      spyOn(firewallService, 'setSelectedFirewall');
      component.ngOnInit();
      expect(firewallService.setSelectedFirewall).toHaveBeenCalled();
    });

    it('should call the subscribe() of FirewallService selectedFirewallStream', () => {
      spyOn(firewallService.selectedFirewallStream, 'subscribe');
      component.ngOnInit();
      expect(firewallService.selectedFirewallStream.subscribe).toHaveBeenCalled();
    });

    it('should set the firewall listsource', () => {
      expect(component.firewallListSource).toBeDefined();
    });
  });

  describe('onFirewallSelect()', () => {
    it('should call the setSelectedFirewall() of FirewallService', () => {
      spyOn(firewallService, 'setSelectedFirewall');
      component.onFirewallSelect(mockFirewallDetails.id);
      expect(firewallService.setSelectedFirewall).toHaveBeenCalled();
    });

    it('should navigate to the selected firewall overview page', () => {
      spyOn(router, 'navigate');
      component.onFirewallSelect(mockFirewallDetails.id);
      expect(router.navigate).toHaveBeenCalled();
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
