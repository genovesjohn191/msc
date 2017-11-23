import {
  async,
  TestBed,
  getTestBed,
  fakeAsync
} from '@angular/core/testing';
import {
  Response,
  RequestMethod,
  URLSearchParams
} from '@angular/http';
import {
  MockBackend,
  MockConnection
} from '@angular/http/testing';
import { ResponseOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
/** Services and Models */
import {
  Firewall,
  FirewallConnectionStatus,
  FirewallConfigurationStatus,
  FirewallDeviceStatus,
  FirewallPolicy,
  FirewallPolicyAction,
  FirewallPolicyNat
} from './models';
import { FirewallsService } from './firewalls.service';
import {
  McsApiSuccessResponse,
  McsApiErrorResponse,
  CoreDefinition
} from '../../../core';
import { NetworkingTestingModule } from '../testing';

describe('FirewallsService', () => {

  /** Stub Services Mock */
  let mockBackend: MockBackend;
  let firewallsService: FirewallsService;

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
      mockBackend = getTestBed().get(MockBackend);
      firewallsService = getTestBed().get(FirewallsService);
    });
  }));

  /** Test Implementation */
  describe('getFirewalls()', () => {

    beforeEach(async () => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: [
              {
                status: 200,
                totalCount: 2,
                content: [
                  {
                    id: 'b044226f-aa25-4fc8-878c-92e6d768d119',
                    serviceId: 'M1VFW27117001',
                    managementName: 'contoso-fw01',
                  },
                  {
                    id: '52380806-b86c-47c8-9cd5-7f8b8edce3eb',
                    serviceId: 'M1VFW27117002',
                    managementName: 'contoso-fw02',
                  }
                ]
              }]
          }
          )));
      });
    });

    it('should map response to McsApiSuccessResponse<Firewall[]> when successful', fakeAsync(() => {
      firewallsService.getFirewalls()
        .subscribe((response) => {
          let mcsApiSucessResponse: McsApiSuccessResponse<Firewall[]>;
          mcsApiSucessResponse = response[0];

          expect(response).toBeDefined();
          expect(mcsApiSucessResponse.status).toEqual(200);
          expect(mcsApiSucessResponse.totalCount).toEqual(2);
          expect(mcsApiSucessResponse.content).toBeDefined();

          expect(mcsApiSucessResponse.content[0].id)
            .toEqual('b044226f-aa25-4fc8-878c-92e6d768d119');
          expect(mcsApiSucessResponse.content[0].serviceId).toEqual('M1VFW27117001');
          expect(mcsApiSucessResponse.content[0].managementName).toEqual('contoso-fw01');

          expect(mcsApiSucessResponse.content[1].id)
          .toEqual('52380806-b86c-47c8-9cd5-7f8b8edce3eb');
          expect(mcsApiSucessResponse.content[1].serviceId).toEqual('M1VFW27117002');
          expect(mcsApiSucessResponse.content[1].managementName).toEqual('contoso-fw02');
        });
    }));

    it('should map response to McsApiErrorResponse when error occured', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Get);

        connection.mockError(new Response(
          new ResponseOptions({
            status: 404,
            statusText: 'error thrown',
            body: {}
          })
        ) as any as Error);
      });

      firewallsService.getFirewalls()
        .catch((error: McsApiErrorResponse) => {
          expect(error).toBeDefined();
          expect(error.status).toEqual(404);
          expect(error.message).toEqual('error thrown');
          return Observable.of(new McsApiErrorResponse());
        })
        .subscribe(() => {
          // dummy subscribe to invoke exception
        });
    }));
  });

  describe('getFirewall()', () => {
    let requestOptions = {
      id: 'b044226f-aa25-4fc8-878c-92e6d768d119',
    };

    beforeEach(async () => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: [
              {
                content: [
                  {
                    id: 'b044226f-aa25-4fc8-878c-92e6d768d119',
                    serviceId: 'M1VFW27117001',
                    managementName: 'contoso-fw01',
                  }
                ],
                totalCount: 1,
                status: 200,
              }]
          }
          )));
      });
    });

    it('should map response to McsApiSuccessResponse<Firewall> when successful', fakeAsync(() => {
      firewallsService.getFirewall(requestOptions.id)
        .subscribe((response) => {
          let mcsApiSucessResponse: McsApiSuccessResponse<Firewall>;
          mcsApiSucessResponse = response;

          expect(response).toBeDefined();
          expect(mcsApiSucessResponse[0].status).toEqual(200);
          expect(mcsApiSucessResponse[0].totalCount).toEqual(1);
          expect(mcsApiSucessResponse[0].content).toBeDefined();

          expect(mcsApiSucessResponse[0].content[0].id).toEqual(requestOptions.id);
          expect(mcsApiSucessResponse[0].content[0].serviceId).toEqual('M1VFW27117001');
          expect(mcsApiSucessResponse[0].content[0].managementName).toEqual('contoso-fw01');
        });
    }));

    it('should map response to McsApiErrorResponse when error occured', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Get);

        connection.mockError(new Response(
          new ResponseOptions({
            status: 404,
            statusText: 'error thrown',
            body: {}
          })
        ) as any as Error);
      });

      firewallsService.getFirewall(requestOptions.id)
        .catch((error: McsApiErrorResponse) => {
          expect(error).toBeDefined();
          expect(error.status).toEqual(404);
          expect(error.message).toEqual('error thrown');
          return Observable.of(new McsApiErrorResponse());
        })
        .subscribe(() => {
          // dummy subscribe to invoke exception
        });
    }));
  });

  describe('getFirewallPolicies()', () => {
    let requestOptions = {
      id: 'b044226f-aa25-4fc8-878c-92e6d768d119',
      page: 1,
      perPage: 10,
      searchKeyword: 'User4'
    };

    beforeEach(async () => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: [
              {
                content: [
                  {
                    id: 'b88892a1-9332-48da-a49c-10edbc8f807b',
                    policyId: 1,
                    objectSequence: 1,
                    action: FirewallPolicyAction.Enabled,
                    nat: FirewallPolicyNat.Enabled,
                    natIpAddresses: [
                      '10.0.0.1',
                      '10.0.0.254'
                    ],
                    sourceAddresses: [
                      '10.135.0.16 - NSX Service Node1',
                      '10.135.0.17 - NSX Service Node2',
                      '10.135.0.18 - NSX Service Node3'
                    ],
                    sourceInterfaces: [
                      'Management'
                    ],
                    destinationAddresses: [
                      '100.64.0.25 - NSX Node IC1'
                    ],
                    destinationInterfaces: [
                      'User2'
                    ],
                    service: [
                      'Any'
                    ],
                    schedule: []
                  },
                  {
                    id: '1585d73f-5bad-4a38-aa6f-d08ada5dcba4',
                    policyId: 2,
                    objectSequence: 2,
                    action: FirewallPolicyAction.Enabled,
                    nat: FirewallPolicyNat.Enabled,
                    natIpAddresses: [
                      '192.168.0.1',
                      '192.168.254'
                    ],
                    sourceAddresses: [
                      '192.135.0.16 - NSX Service Node1',
                      '192.135.0.17 - NSX Service Node2',
                      '192.135.0.18 - NSX Service Node3'
                    ],
                    sourceInterfaces: [
                      'Management'
                    ],
                    destinationAddresses: [
                      '128.64.0.25 - NSX Node IC1'
                    ],
                    destinationInterfaces: [
                      'User4'
                    ],
                    service: [
                      'Any'
                    ],
                    schedule: []
                  }
                ],
                totalCount: 2,
                status: 200,
              }]
          }
          )));
      });
    });

    it('should set the parameters(page, per_page, search_keyword) based on input', fakeAsync(() => {
      mockBackend.connections.subscribe((connection) => {
        let parameters = connection.request.url.split('?');
        let urlSearchParams: URLSearchParams;
        urlSearchParams = new URLSearchParams(parameters[1]);

        expect(urlSearchParams.get('page')).toEqual(requestOptions.page.toString());
        expect(urlSearchParams.get('per_page')).toEqual(requestOptions.perPage.toString());
        expect(urlSearchParams.get('search_keyword')).toEqual(requestOptions.searchKeyword);
        expect(connection.request.method).toBe(RequestMethod.Get);
      });
    }));

    it('should map response to McsApiSuccessResponse<FirewallPolicy> when successful',
      fakeAsync(() => {
      firewallsService.getFirewallPolicies(requestOptions.id)
        .subscribe((response) => {
          let mcsApiSucessResponse: McsApiSuccessResponse<FirewallPolicy[]>;
          mcsApiSucessResponse = response;

          expect(response).toBeDefined();
          expect(mcsApiSucessResponse[0].status).toEqual(200);
          expect(mcsApiSucessResponse[0].totalCount).toEqual(2);
          expect(mcsApiSucessResponse[0].content).toBeDefined();

          expect(mcsApiSucessResponse[0].content[0].id)
            .toEqual('b88892a1-9332-48da-a49c-10edbc8f807b');
          expect(mcsApiSucessResponse[0].content[0].objectSequence).toEqual(1);

          expect(mcsApiSucessResponse[0].content[1].id)
          .toEqual('1585d73f-5bad-4a38-aa6f-d08ada5dcba4');
          expect(mcsApiSucessResponse[0].content[1].objectSequence).toEqual(2);
        });
    }));

    it('should map response to McsApiErrorResponse when error occured', fakeAsync(() => {
      mockBackend.connections.subscribe((connection: MockConnection) => {
        expect(connection.request.method).toBe(RequestMethod.Get);

        connection.mockError(new Response(
          new ResponseOptions({
            status: 404,
            statusText: 'error thrown',
            body: {}
          })
        ) as any as Error);
      });

      firewallsService.getFirewallPolicies(requestOptions.id)
        .catch((error: McsApiErrorResponse) => {
          expect(error).toBeDefined();
          expect(error.status).toEqual(404);
          expect(error.message).toEqual('error thrown');
          return Observable.of(new McsApiErrorResponse());
        })
        .subscribe(() => {
          // dummy subscribe to invoke exception
        });
    }));
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
