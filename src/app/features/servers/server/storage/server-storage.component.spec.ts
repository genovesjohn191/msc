import {
  async,
  inject,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ServerStorageComponent } from './server-storage.component';
import { Server } from '../../models';
import {
  CoreDefinition,
  McsList
} from '../../../../core';
import { ServerService } from '../server.service';
import { ServersTestingModule } from '../../testing';

describe('ServerStorageComponent', () => {
  /** Stub Services/Components */
  let component: ServerStorageComponent;
  let serverService: ServerService;
  let mockServerDetails = {
    id: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
    managementName: 'contoso-lin01',
    vdcName: 'M1VDC27117001',
    storageDevice: [
      {
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
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should get the server details from ServerService selectedServerStream', () => {
      serverService.selectedServerStream.next(mockServerDetails as Server);
      expect(component.server).toBeDefined();
    });

    it('should set the storage icon key', () => {
      expect(component.storageIconKey).toEqual(CoreDefinition.ASSETS_SVG_STORAGE);
    });

    it('should define the value of serverStorageText', () => {
      expect(component.serverStorageText).toBeDefined();
    });

    it('should define the storageDevices', () => {
      expect(component.storageDevices).toBeDefined();
    });

    it('should define the storageProfileList', () => {
      expect(component.storageProfileList).toBeDefined();
    });

    it('should define the serverPlatformData', () => {
      expect(component.storageDevices).toBeDefined();
    });

    it('should define the serverPlatformStorage', () => {
      expect(component.storageProfileList).toBeDefined();
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
