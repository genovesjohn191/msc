import {
  async,
  inject,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ServerStorageComponent } from './server-storage.component';
import {
  Server,
  ServerFileSystem,
  ServerManageStorage,
  ServerPlatform,
  ServerResource,
  ServerStorage,
  ServerStorageDevice,
  ServerStorageDeviceUpdate,
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsList,
  McsListItem,
  McsNotificationContextService,
  McsApiJob,
  McsJobType
} from '../../../../core';
import { ServerService } from '../server.service';
import { ServersTestingModule } from '../../testing';
import {
  appendUnitSuffix,
  convertToGb,
  animateFactory,
  mergeArrays
} from '../../../../utilities';

describe('ServerStorageComponent', () => {
  /** Stub Services/Components */
  let component: ServerStorageComponent;
  let serverService: ServerService;
  let notificationContextService: McsNotificationContextService;
  let mockServerDetails = {
    id: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
    managementName: 'contoso-lin01',
    vdcName: 'M1VDC27117001',
    storageDevice: [
      {
        id: '1d6d55d7-0b02-4341-9359-2e4bc783d9b1',
        name: 'Hard disk 1',
        sizeMB: 524288.00,
        storageDeviceType: 'VMDK',
        storageDeviceInterfaceType: 'SCSI',
        backingVcenter: 'testvcdvc0301',
        backingId: 'datastore-64',
        storageProfile: 'T2000-PVDC0301',
        wwn: null,
        vendor: 'VMware',
        remoteHost: null,
        remotePath: null
      }
    ],
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerStorageComponent
      ],
      imports: [
        ServersTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerStorageComponent, {
      set: {
        template: `
          <div>Server Storage Component Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerStorageComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      serverService = getTestBed().get(ServerService);
      notificationContextService = getTestBed().get(McsNotificationContextService);
    });
  }));

  /** Test Implementation */
  // TODO: Update unit test after the demo
  describe('ngOnInit()', () => {
    beforeEach(async(() => {
      let notifications: McsApiJob[] = new Array();
      let notificationActive = new McsApiJob();
      notificationActive.id = '5';
      notificationActive.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
      notificationActive.clientReferenceObject = {
        serverId: mockServerDetails.id
      };
      notifications.push(notificationActive);
      notificationContextService.notificationsStream.next(notifications);
    }));

    it('should call the subscribe() of ServerService selectedServiceStream', () => {
      spyOn(serverService.selectedServerStream, 'subscribe');
      component.ngOnInit();
      expect(serverService.selectedServerStream.subscribe).toHaveBeenCalled();
    });

    it('should call the subscribe() of notificationContextService notificationsStream', () => {
      spyOn(notificationContextService.notificationsStream, 'subscribe');
      component.ngOnInit();
      expect(notificationContextService.notificationsStream.subscribe).toHaveBeenCalled();
    });

    it('should set the storage icon key', () => {
      expect(component.storageIconKey).toEqual(CoreDefinition.ASSETS_SVG_STORAGE);
    });

    it('should define the value of serverStorageText', () => {
      expect(component.serverStorageText).toBeDefined();
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from the subscription', () => {
      spyOn(component.serverSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.serverSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
