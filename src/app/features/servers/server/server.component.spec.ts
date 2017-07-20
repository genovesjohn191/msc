import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ServerComponent } from './server.component';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { ServersTestingModule } from '../testing';
import {
  Server,
  ServerPowerState,
  ServerCommand
} from '../models';
import { ServerService } from '../server/server.service';

describe('ServerComponent', () => {
  /** Stub Services/Components */
  let component: ServerComponent;
  let serverService: ServerService;
  let mockActivatedRoute = {
    snapshot: {
      data: {
        servers: {
          content: 'servers list'
        },
        server: {
          content: 'server details'
        }
      }
    }
  };
  let mockServerDetails = {
    id: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
    managementName: 'contoso-lin01',
    vdcName: 'M1VDC27117001',
    serviceType: 'Managed',
    powerState: ServerPowerState.PoweredOn,
    fileSystem: [
      {
        path: '/',
        capacityGB: 49,
        freeSpaceGB: 48
      },
      {
        path: '/boot',
        capacityGB: 1,
        freeSpaceGB: 1
      },
      {
        path: '/tmp',
        capacityGB: 49,
        freeSpaceGB: 48
      },
      {
        path: '/var/tmp',
        capacityGB: 49,
        freeSpaceGB: 48
      }
    ],
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerComponent
      ],
      imports: [
        ServersTestingModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
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

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      serverService = getTestBed().get(ServerService);
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should define the text content value to serverManagementTextContent', () => {
      expect(component.serverTextContent).toBeDefined();
    });

    it('should call the subscribe() of ServerService selectedServiceStream', () => {
      spyOn(serverService.selectedServerStream, 'subscribe');
      component.ngOnInit();
      expect(serverService.selectedServerStream.subscribe).toHaveBeenCalled();
    });

    it('should get the servers from activated route snapshot data', () => {
      expect(component.servers).toBeDefined();
    });

    it('should get the selected server details from activated route snapshot data', () => {
      expect(component.server).toBeDefined();
    });
  });

  describe('onServerSelect()', () => {
    it('should call the setSelectedServer() of ServerService', () => {
      spyOn(serverService, 'setSelectedServer');
      component.onServerSelect(mockServerDetails.id);
      expect(serverService.setSelectedServer).toHaveBeenCalled();
    });
  });

  describe('getActionStatus()', () => {
    it('should return the server action status', () => {
      expect(component.getActionStatus(mockServerDetails as Server)).toEqual(ServerCommand.Start);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from the subscription', () => {
      spyOn(component.selectedServerSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.selectedServerSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
