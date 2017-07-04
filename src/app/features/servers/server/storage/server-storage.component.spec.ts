import {
  async,
  inject,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ServerStorageComponent } from './server-storage.component';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
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

describe('ServerStorageComponent', () => {
  /** Stub Services/Components */
  let component: ServerStorageComponent;
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
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
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
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should get the server details from activated route snapshot data', () => {
      component.ngOnInit();
      expect(component.server).toBeDefined();
    });

    it('should get the server\'s primary storage', () => {
      component.ngOnInit();
      expect(component.primaryStorage).toEqual(mockServerDetails.fileSystem[0]);
    });

    it('should get the server\'s other storage', () => {
      component.ngOnInit();
      expect(component.otherStorage).toEqual(mockServerDetails.fileSystem.slice(1));
    });

    it('should set the storage icon key', () => {
      component.ngOnInit();
      expect(component.storageIconKey).toEqual(CoreDefinition.ASSETS_SVG_STORAGE);
    });

    it('should set the value of serverStorageText', () => {
      component.ngOnInit();
      expect(component.serverStorageText)
        .toEqual(mockTextContentProvider.content.servers.server.storage);
    });

    it('should get the server\'s storage total free space', () => {
      component.ngOnInit();
      expect(component.storageAvailableMemoryInGb).toBeDefined();
    });

    it('should get the server\'s storage profiles', () => {
      component.ngOnInit();
      expect(component.storageProfileItems).toBeDefined();
    });
  });
});
