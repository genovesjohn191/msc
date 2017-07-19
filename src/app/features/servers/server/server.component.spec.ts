import {
  async,
  inject,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ServerComponent } from './server.component';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Server,
  ServerClientObject,
  ServerPowerState,
  ServerCommand
} from '../models';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../core';
import { ServersService } from '../servers.service';
import { ServerService } from '../server/server.service';
import {
  Observable,
  Subject
} from 'rxjs/Rx';

describe('ServerComponent', () => {
  /** Stub Services/Components */
  let component: ServerComponent;
  let serversService: ServersService;
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
  let textContentProviderMock = {
    content: {
      servers: {
        server: 'Server Details'
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
  let mockRouterService = {
    navigate(): any { return null; }
  };
  let serversServiceMock = {
    activeServersStream: new Subject<any>(),
    postServerCommand(id: any, action: string): Observable<Response> {
      return Observable.of(new Response());
    }
  };
  let mockServerService = {
    selectedServerStream: new Subject<any>(),
    setSelectedServer(serverId: string) {
      return serverId;
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerComponent
      ],
      imports: [
      ],
      providers: [
        { provide: Router, useValue: mockRouterService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ServersService, useValue: serversServiceMock },
        { provide: McsTextContentProvider, useValue: textContentProviderMock },
        { provide: ServerService, useValue: mockServerService }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
      serversService = getTestBed().get(ServersService);
      serverService = getTestBed().get(ServerService);
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should set the text content values to serverManagementTextContent', () => {
      expect(component.serverTextContent).toEqual(textContentProviderMock.content.servers.server);
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
