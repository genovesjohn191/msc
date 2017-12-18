import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ServerManagementComponent } from './server-management.component';
import {
  Server,
  ServerServiceType
} from '../../models';
import {
  CoreDefinition,
  McsNotificationContextService,
  McsApiJob
} from '../../../../core';
import { ServerService } from '../server.service';
import {
  mockServerService,
  ServersTestingModule
} from '../../testing';

describe('ServerManagementComponent', () => {
  /** Stub Services/Components */
  let component: ServerManagementComponent;
  let serverService: ServerService;
  let notificationContextService: McsNotificationContextService;
  let mockServerDetails = {
    id: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
    managementName: 'contoso-lin01',
    platform: {
      environmentName: 'Macquarie_Telecom_Contoso_100320',
      resourceName: 'M1VDC27117001'
    },
    serviceType: ServerServiceType.Managed,
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
      }
    ],
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerManagementComponent
      ],
      imports: [
        ServersTestingModule
      ]
    });

    /** Testbed Onverriding of Providers */
    TestBed.overrideProvider(ServerService, { useValue: mockServerService });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerManagementComponent, {
      set: {
        template: `
          <div>Server Management Component Template</div>
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
      notificationActive.clientReferenceObject = {
        activeServerId: mockServerDetails.id
      };
      notifications.push(notificationActive);
      notificationContextService.notificationsStream.next(notifications);

      serverService.selectedServerStream.next(mockServerDetails as Server);
    }));

    it('should define the text content values to serverManagementTextContent', () => {
      expect(component.serverManagementTextContent).toBeDefined();
    });

    it('should set the value of server', () => {
      expect(component.server).toBeDefined();
    });

    it('should set the serverThumbnail value to undefined since the process is in progress', () => {
      expect(component.serverThumbnail).toBeUndefined();
    });

    it('should set the thumbnailElement value', () => {
      expect(component.thumbnailElement).toBeDefined();
    });
  });

  describe('IconKey() | Properties', () => {
    it('should get the warning icon key definition', () => {
      expect(component.warningIconKey).toBe(CoreDefinition.ASSETS_FONT_WARNING);
    });

    it('should get the spinner icon key definition', () => {
      expect(component.spinnerIconKey).toBe(CoreDefinition.ASSETS_GIF_SPINNER);
    });
  });
});
