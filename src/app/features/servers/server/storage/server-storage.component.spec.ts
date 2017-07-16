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
  ServerManageStorage
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsList,
  McsListItem
} from '../../../../core';
import { ServerService } from '../server.service';
import { Subject } from 'rxjs/Rx';

describe('ServerStorageComponent', () => {
  /** Stub Services/Components */
  let component: ServerStorageComponent;
  let serverService: ServerService;
  let mockTextContentProvider = {
    content: {
      servers: {
        server: {
          management: 'server management',
          storage:{
            label: 'Storage',
            title: 'Manage Storage',
            primary: 'Primary',
            other: 'Other',
            increaseStorage: 'Increase',
            deleteStorage: 'Delete',
            deleteStorageAlertMessage: 'The data on volume {volume_name} will be lost forever.',
            deleteStorageConfirmation: 'Are you sure you want to delete this volume?',
            addStorage: 'Add New Storage Volume.',
            resizeStorage: 'Resize Volume : ',
            unit: 'GB'
          }
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
  let mockServerService = {
    selectedServerStream: new Subject<any>(),
    setPerformanceScale(serverId: any, cpuSizeScale: any) { return; }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerStorageComponent
      ],
      imports: [
      ],
      providers: [
        { provide: McsTextContentProvider, useValue: mockTextContentProvider },
        { provide: ServerService, useValue: mockServerService }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerStorageComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
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

    it('should get the server\'s primary storage', () => {
      serverService.selectedServerStream.next(mockServerDetails as Server);
      expect(component.primaryStorage).toEqual(mockServerDetails.fileSystem[0]);
    });

    it('should get the server\'s other storage', () => {
      serverService.selectedServerStream.next(mockServerDetails as Server);
      expect(component.otherStorage).toEqual(mockServerDetails.fileSystem.slice(1));
    });

    it('should get the server\'s storage total free space', () => {
      serverService.selectedServerStream.next(mockServerDetails as Server);
      expect(component.storageAvailableMemoryInGb).toBeDefined();
    });

    it('should set the storage icon key', () => {
      expect(component.storageIconKey).toEqual(CoreDefinition.ASSETS_SVG_STORAGE);
    });

    it('should set the value of serverStorageText', () => {
      expect(component.serverStorageText)
        .toEqual(mockTextContentProvider.content.servers.server.storage);
    });

    it('should get the server\'s storage profiles', () => {
      expect(component.storageProfileItems).toBeDefined();
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from the subscription', () => {
      spyOn(component.subscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.subscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
