import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import {
  McsApiSuccessResponse,
  McsFirewall
} from '@app/models';
import { FirewallsService } from './firewalls.service';
import { FirewallsTestingModule } from './testing';

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
        FirewallsTestingModule
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
        searchKeyword: undefined
      }).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpRequest = httpMock.expectOne(
        `/firewalls?page=${requestOptions.page}&per_page=${requestOptions.perPage}`
      );
      expect(httpRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsFirewall[]>();
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
      let responseData = new McsApiSuccessResponse<McsFirewall>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });

  describe('getFirewallPolicies()', () => {
    it('should get all firewall policies from API calls', () => {
      firewallsService.getFirewallPolicies(
        requestOptions.id,
        {
          page: requestOptions.page
        }).subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(2);
        });

      // Create request to the backend and expect that the request happened
      let httpRequest = httpMock.expectOne(
        `/firewalls/${requestOptions.id}/policies?page=${requestOptions.page}`
      );
      expect(httpRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsFirewall[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpRequest.flush(responseData);
    });
  });
});
