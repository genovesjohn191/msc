import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import {
  Firewall,
  FirewallConnectionStatus,
  FirewallConfigurationStatus,
  FirewallDeviceStatus
} from './models';
import { FirewallsService } from './firewalls.service';
import {
  McsApiSuccessResponse,
  CoreDefinition
} from '../../../core';
import { NetworkingTestingModule } from '../testing';

describe('FirewallsService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let firewallsService: FirewallsService;
  let requestOptions = {
    page: 1,
    perPage: 10,
    searchKeyword: 'Arrian',
    id: 459
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        NetworkingTestingModule
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      httpMock = getTestBed().get(HttpTestingController);
      firewallsService = getTestBed().get(FirewallsService);
    });
  }));

  /** Test Implementation */
  describe('getFirewalls()', () => {
    it('should get all firewalls from API calls', () => {
      firewallsService.getFirewalls({
        page: requestOptions.page,
        perPage: requestOptions.perPage,
        searchKeyword: requestOptions.searchKeyword
      }).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpRequest = httpMock.expectOne('/firewalls');
      expect(httpRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<Firewall[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpRequest.flush(responseData);
    });
  });

  describe('getFirewall()', () => {
    it('should get the firewall based on ID from API calls', () => {
      firewallsService.getFirewall(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/firewalls/${requestOptions.id}`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<Firewall>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('getFirewallPolicies()', () => {
    it('should get all firewall policies from API calls', () => {
      firewallsService.getFirewallPolicies(
        requestOptions.id,
        requestOptions.page,
        requestOptions.perPage,
        requestOptions.searchKeyword
      ).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpRequest = httpMock.expectOne(`/firewalls/${requestOptions.id}/policies`);
      expect(httpRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<Firewall[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpRequest.flush(responseData);
    });
  });

  describe('getFirewallConnectionStatusIconKey()', () => {
    it('should return green status icon key when the connection status is Up', () => {
      expect(firewallsService.getFirewallConnectionStatusIconKey(FirewallConnectionStatus.Up))
        .toEqual(CoreDefinition.ASSETS_SVG_STATE_RUNNING);
    });

    it('should return red status icon key when the connection status is Down', () => {
      expect(firewallsService.getFirewallConnectionStatusIconKey(FirewallConnectionStatus.Down))
        .toEqual(CoreDefinition.ASSETS_SVG_STATE_STOPPED);
    });

    it('should return amber status icon key when the connection status is Unknown', () => {
      expect(firewallsService.getFirewallConnectionStatusIconKey(FirewallConnectionStatus.Unknown))
        .toEqual(CoreDefinition.ASSETS_SVG_STATE_RESTARTING);
    });
  });

  describe('getFirewallConfigurationStatusIconKey()', () => {
    it('should return green status icon key when the configuration status is InSync', () => {
      expect(firewallsService.getFirewallConfigurationStatusIconKey(
        FirewallConfigurationStatus.InSync)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RUNNING);
    });

    it('should return red status icon key when the configuration status is OutOfSync', () => {
      expect(firewallsService.getFirewallConfigurationStatusIconKey(
        FirewallConfigurationStatus.OutOfSync)).toEqual(CoreDefinition.ASSETS_SVG_STATE_STOPPED);
    });

    it('should return amber status icon key when the configuration status is Unknown', () => {
      expect(firewallsService.getFirewallConfigurationStatusIconKey(
        FirewallConfigurationStatus.Unknown)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RESTARTING);
    });
  });

  describe('getFirewallDeviceStatusIconKey()', () => {
    it('should return green status icon key', () => {
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.AutoUpdated)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RUNNING);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.InProgress)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RUNNING);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.Retrieved)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RUNNING);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.Reverted)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RUNNING);
    });

    it('should return red status icon key', () => {
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.Aborted)).toEqual(CoreDefinition.ASSETS_SVG_STATE_STOPPED);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.Cancelled)).toEqual(CoreDefinition.ASSETS_SVG_STATE_STOPPED);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.None)).toEqual(CoreDefinition.ASSETS_SVG_STATE_STOPPED);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.SyncFailed)).toEqual(CoreDefinition.ASSETS_SVG_STATE_STOPPED);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.Timeout)).toEqual(CoreDefinition.ASSETS_SVG_STATE_STOPPED);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.Unknown)).toEqual(CoreDefinition.ASSETS_SVG_STATE_STOPPED);
    });

    it('should return amber status icon key', () => {
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.ChangedConfig)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RESTARTING);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.CheckedIn)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RESTARTING);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.Installed)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RESTARTING);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.Pending)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RESTARTING);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.Retry)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RESTARTING);
      expect(firewallsService.getFirewallDeviceStatusIconKey(
        FirewallDeviceStatus.Sched)).toEqual(CoreDefinition.ASSETS_SVG_STATE_RESTARTING);
    });
  });
});
