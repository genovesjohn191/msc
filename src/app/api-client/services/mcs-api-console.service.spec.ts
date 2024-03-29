import { HttpTestingController } from '@angular/common/http/testing';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import {
  McsApiSuccessResponse,
  McsConsole
} from '@app/models';

import { McsApiClientTestingModule } from '../testing';
/** Services and Models */
import { McsApiConsoleService } from './mcs-api-console.service';

describe('McsApiConsoleService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let consoleService: McsApiConsoleService;
  let requestOptions = {
    id: '459'
  };

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        McsApiClientTestingModule
      ]
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      httpMock = TestBed.inject(HttpTestingController);
      consoleService = TestBed.inject(McsApiConsoleService);
    });
  }));

  /** Test Implementation */
  describe('getServerConsole()', () => {
    it('should get the server console based on ID from API calls', () => {
      consoleService.getServerConsole(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let mockRequest = httpMock.expectOne(`/private-cloud/servers/${requestOptions.id}/console`);
      expect(mockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsConsole>();
      responseData.status = 200;
      responseData.totalCount = 1;
      mockRequest.flush(responseData);
    });
  });
});
