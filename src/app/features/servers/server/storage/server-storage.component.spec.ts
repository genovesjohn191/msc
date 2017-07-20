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

    it('should define the value of serverStorageText', () => {
      expect(component.serverStorageText).toBeDefined();
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
