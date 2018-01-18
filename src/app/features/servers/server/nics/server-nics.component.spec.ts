import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { ServerNicsComponent } from './server-nics.component';
import {
  CoreDefinition,
  McsNotificationContextService,
  McsApiJob
} from '../../../../core';
import { ServerService } from '../server.service';
import { ServersTestingModule } from '../../testing';
import {
  ServerIpAddress,
  ServerIpAllocationMode
} from '../../models';

describe('ServerNicsComponent', () => {
  /** Stub Services/Components */
  let component: ServerNicsComponent;
  let serverService: ServerService;
  let notificationContextService: McsNotificationContextService;
  let mockServerDetails = {
    id: '52381b70-ed47-4ab5-8f6f-0365d4f76148',
    managementName: 'contoso-lin01',
  };
  let mockServerNetworks = [
    {
      id: 'ff474c18-9d3e-4214-b33f-f434a689bca4',
      name: 'Customer_100320-V1012-Web-M1VLN27117001',
      index: 0,
      ipAllocationMode: ServerIpAllocationMode.Pool,
      ipAddress: '172.30.21.110',
      macAddress: '00:50:56:03:00:df'
    },
    {
      id: 'eb1750a7-47e1-41a8-9a8b-4f8b3be1bd0f',
      name: 'Customer_100320-V1010-Management-MMGMT27117001',
      index: 2,
      ipAllocationMode: ServerIpAllocationMode.Dhcp,
      ipAddress: null,
      macAddress: '00:50:56:03:01:7c'
    }
  ];
  let mockTextContent = {
    static: 'Static - IP Pool',
    dynamic: 'Dynamic - IP Pool',
    dhcp: 'DHCP'
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerNicsComponent
      ],
      imports: [
        ServersTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerNicsComponent, {
      set: {
        template: `
          <div>Server NICs Component Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerNicsComponent);
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
        serverId: mockServerDetails.id,
        networkId: mockServerNetworks[0].id
      };
      notifications.push(notificationActive);
      notificationContextService.notificationsStream.next(notifications);
    }));

    it('should define the value of textContent', () => {
      expect(component.textContent).toBeDefined();
    });
  });

  describe('onIpAddressChanged()', () => {
    it('should set the value of ipAddress if valid', () => {
      let ipAddress = {
        ipAllocationMode: ServerIpAllocationMode.Dhcp,
        valid: true
      } as ServerIpAddress;

      component.onIpAddressChanged(ipAddress);
      expect(component.ipAddress.ipAllocationMode).toEqual(ipAddress.ipAllocationMode);
    });
  });

  describe('validate()', () => {
    it('should return true if the values are valid in adding new NIC', () => {
      component.networkName = 'Customer_100320-V1012-Web-M1VLN27117001';
      component.ipAddress.valid = true;

      expect(component.validate()).toBeTruthy();
    });

    it('should return false if the values are invalid in adding new NIC', () => {
      component.networkName = '';
      component.ipAddress.valid = false;

      expect(component.validate()).toBeFalsy();
    });

    it('should return true if there are changes in editing NIC', () => {
      component.isUpdate = true;
      component.selectedNic.name = 'Customer_100320-V1012-Web-M1VLN27117001';
      component.selectedNic.ipAllocationMode = ServerIpAllocationMode.Dhcp;

      component.networkName = 'Customer_100320-V1012-Web-M1VLN27117001';
      component.ipAddress.ipAllocationMode = ServerIpAllocationMode.Pool;
      component.ipAddress.valid = true;

      expect(component.validate()).toBeTruthy();
    });

    it('should return false if there are no changes in editing NIC', () => {
      component.isUpdate = true;
      component.networkName = 'Customer_100320-V1012-Web-M1VLN27117001';
      component.ipAddress.valid = true;

      component.selectedNic.name = 'Customer_100320-V1012-Web-M1VLN27117001';

      expect(component.validate()).toBeFalsy();
    });
  });

  describe('getIpAllocationModeText()', () => {
    it('should return the label for Dhcp IP Allocation Mode', () => {
      expect(component.getIpAllocationModeText(ServerIpAllocationMode.Dhcp))
        .toBe(mockTextContent.dhcp);
    });

    it('should return the label for Pool IP Allocation Mode', () => {
      expect(component.getIpAllocationModeText(ServerIpAllocationMode.Pool))
        .toBe(mockTextContent.dynamic);
    });

    it('should return the label for Manual IP Allocation Mode', () => {
      expect(component.getIpAllocationModeText(ServerIpAllocationMode.Manual))
        .toBe(mockTextContent.static);
    });
  });
});
