import {
  async,
  inject,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ServerManagementComponent } from './server-management.component';
import {
  Router,
  ActivatedRoute,
  Data,
  NavigationEnd
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {
  Server,
  ServerPerformanceScale
} from '../../models';
import {
  McsTextContentProvider,
  McsBrowserService,
  CoreDefinition
} from '../../../../core';
import { ServerService } from '../server.service';

describe('ServerManagementComponent', () => {
  /** Stub Services/Components */
  let component: ServerManagementComponent;
  let serverService: ServerService;
  let mockTextContentProvider = {
    content: {
      servers: {
        server: {
          management: 'server management'
        }
      }
    }
  };
  let mockServerDetails = {
    id: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
    managementName: 'contoso-lin01',
    vdcName: 'M1VDC27117001',
    fileSystem: [
      {
        path: '/',
        capacityInGb: 49,
        freeSpaceInGb: 48
      },
      {
        path: '/boot',
        capacityInGb: 1,
        freeSpaceInGb: 1
      },
      {
        path: '/tmp',
        capacityInGb: 49,
        freeSpaceInGb: 48
      },
      {
        path: '/var/tmp',
        capacityInGb: 49,
        freeSpaceInGb: 48
      }
    ],
  };
  let navigationEnd = new NavigationEnd(
    1, '/servers', '/servers');
  let mockRouterService = {
    navigate(): any { return null; },
    events: new Observable((observer) => {
      observer.next(navigationEnd);
      observer.complete();
    })
  };
  let mockActivatedRoute = {
    parent: {
      snapshot: {
        data: {
          server: {
            content: mockServerDetails
          }
        }
      }
    }
  };
  let mockServerService = {
    setPerformanceScale(serverId: any, cpuSizeScale: any) { return; }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerManagementComponent
      ],
      imports: [
      ],
      providers: [
        { provide: McsTextContentProvider, useValue: mockTextContentProvider },
        { provide: Router, useValue: mockRouterService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        McsBrowserService,
        { provide: ServerService, useValue: mockServerService }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerManagementComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerManagementComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      serverService = getTestBed().get(ServerService);
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should get the server details from activated route snapshot data',
      inject([Router], (routerService: Router) => {
        component.ngOnInit();
        expect(component.server).toBeDefined();
      }));

    it('should set the primaryVolume value',
      inject([Router], (routerService: Router) => {
        component.ngOnInit();
        expect(component.primaryVolume).toBeDefined();
      }));

    it('should set the secondaryVolume value if the fileSystem is more than one',
      inject([Router], (routerService: Router) => {
        component.ngOnInit();
        expect(component.secondaryVolumes).toBeDefined();
      }));

    it('should set the value of serverManagement', () => {
      component.ngOnInit();
      expect(component.serverManagementTextContent).toBeDefined();
    });
  });

  describe('IconKey() | Properties', () => {
    it('should get the warning icon key definition', () => {
      expect(component.warningIconKey).toBe(CoreDefinition.ASSETS_FONT_WARNING);
    });
  });

  describe('onClickScale()', () => {
    beforeEach(async(() => {
      component.onScaleChanged(new ServerPerformanceScale());
    }));

    it('should call the setPerformanceScale of the serverService 1 time', () => {
      spyOn(serverService, 'setPerformanceScale');
      component.onClickScale(undefined);
      expect(serverService.setPerformanceScale).toHaveBeenCalledTimes(1);
    });
  });
});
