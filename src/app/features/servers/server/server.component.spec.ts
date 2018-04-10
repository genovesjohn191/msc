import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ServerComponent } from './server.component';
import { Router } from '@angular/router';
import {
  ServersTestingModule,
  mockServerService
} from '../testing';
import {
  Server,
  ServerPowerState,
  ServerServiceType
} from '../models';
import { ServerService } from '../server/server.service';

describe('ServerComponent', () => {
  /** Stub Services/Components */
  let component: ServerComponent;
  let router: Router;
  let mockServerDetails = {
    id: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
    name: 'contoso-lin01',
    platform: {
      environmentName: 'Macquarie_Telecom_Contoso_100320',
      resourceName: 'M1VDC27117001'
    },
    serviceType: ServerServiceType.Managed,
    powerState: ServerPowerState.PoweredOn,
  } as Server;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerComponent
      ],
      imports: [
        ServersTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerComponent, {
      set: {
        template: `
          <div>Server Component Template</div>
        `
      }
    });

    /** Testbed Onverriding of Providers */
    TestBed.overrideProvider(ServerService, { useValue: mockServerService });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      router = getTestBed().get(Router);
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should define the text content value to serverManagementTextContent', () => {
      expect(component.textContent).toBeDefined();
    });

    it('should set the value of server', () => {
      expect(component.server).toBeDefined();
    });
  });

  describe('onServerSelect()', () => {
    it('should set the value of server from the selected server', () => {
      component.onServerSelect(mockServerDetails);
      expect(component.server).toBeDefined();
    });

    it('should navigate to the selected server management page', () => {
      spyOn(router, 'navigate');
      component.onServerSelect(mockServerDetails);
      expect(router.navigate).toHaveBeenCalled();
    });
  });
});
