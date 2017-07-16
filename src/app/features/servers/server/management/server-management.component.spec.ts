import {
  async,
  inject,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ServerManagementComponent } from './server-management.component';
import {
  Server,
  ServerFileSystem,
  ServerPerformanceScale,
  ServerThumbnail
} from '../../models';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsList,
  McsListItem,
  McsNotificationContextService,
  McsNotificationJobService,
  McsApiSuccessResponse,
  McsApiJob,
  McsConnectionStatus,
  McsApiRequestParameter,
  McsApiService
} from '../../../../core';
import { getEncodedUrl } from '../../../../utilities';
import { ServerService } from '../server.service';
import {
  Subject,
  Observable
} from 'rxjs/Rx';

describe('ServerManagementComponent', () => {
  /** Stub Services/Components */
  let component: ServerManagementComponent;
  let serverService: ServerService;
  let notificationContextService: McsNotificationContextService;
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
    serviceType: 'Managed',
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
    selectedServerStream: new Subject<any>(),
    setPerformanceScale(
      serverId: any,
      cpuSizeScale: any): Observable<McsApiSuccessResponse<McsApiJob>> {

      let mcsApiResponseMock = new McsApiSuccessResponse<McsApiJob>();
      mcsApiResponseMock.status = 200;
      mcsApiResponseMock.totalCount = 2;
      mcsApiResponseMock.content = new McsApiJob();

      return Observable.of(mcsApiResponseMock);
    },
    getServerThumbnail(serverId: any) {
      return Observable.of({
        content: {
          file: 'aaaBBBcccDDD',
          fileType: 'image/png',
          encoding: 'base64'
        } as ServerThumbnail
      });
    }
  };
  let mockMcsNotificationJobService = {
    notificationStream: new Subject<McsApiJob>(),
    connectionStatusStream: new Subject<McsConnectionStatus>()
  } as McsNotificationJobService;
  let mockMcsApiService = {
    get(apiRequest: McsApiRequestParameter): Observable<Response> {
      return Observable.of(new Response());
    }
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
        { provide: ServerService, useValue: mockServerService },
        { provide: McsApiService, useValue: mockMcsApiService },
        { provide: McsNotificationJobService, useValue: mockMcsNotificationJobService },
        McsNotificationContextService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerManagementComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
          <img #thumbnailElement/>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerManagementComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      serverService = getTestBed().get(ServerService);
      notificationContextService = getTestBed().get(McsNotificationContextService);
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    beforeEach(async(() => {
      let notifications: McsApiJob[] = new Array();
      let notificationActive = new McsApiJob();
      notificationActive.id = '5';
      notificationActive.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
      notifications.push(notificationActive);
      notificationContextService.notificationsStream.next(notifications);
    }));

    it('should set the text content values to serverManagementTextContent', () => {
      expect(component.serverManagementTextContent)
        .toEqual(mockTextContentProvider.content.servers.server.management);
    });

    it('should set the value of server', () => {
      serverService.selectedServerStream.next(mockServerDetails as Server);
      expect(component.server).toBeDefined();
    });

    it('should set the value of serviceType', () => {
      serverService.selectedServerStream.next(mockServerDetails as Server);
      expect(component.serviceType).toBeDefined();
    });

    it('should set the serverThumbnail value', () => {
      serverService.selectedServerStream.next(mockServerDetails as Server);
      expect(component.serverThumbnail).toBeDefined();
    });

    it('should set the thumbnailElement value', () => {
      expect(component.thumbnailElement).toBeDefined();
    });
  });

  describe('IconKey() | Properties', () => {
    it('should get the warning icon key definition', () => {
      expect(component.warningIconKey).toBe(CoreDefinition.ASSETS_FONT_WARNING);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from the subscription', () => {

      spyOn(component.serverSubscription, 'unsubscribe');
      spyOn(component.notificationsSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.serverSubscription.unsubscribe).toHaveBeenCalled();
      expect(component.notificationsSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
